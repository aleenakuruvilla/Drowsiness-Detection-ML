import cv2
import numpy as np
import dlib
from imutils import face_utils
import time
import requests
from dotenv import load_dotenv
import os
import threading
import argparse
import logging
from datetime import datetime

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("drowsiness_detection.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class DrowsinessDetector:
    EAR_THRESHOLD_HALF = 0.25  # Drowsy threshold
    EAR_THRESHOLD_FULL = 0.21  # Sleep threshold
    MAR_THRESHOLD_YAWN = 0.6   # Yawn threshold
    DROWSY_THRESHOLD_TIME = 2.0  # seconds
    SLEEP_THRESHOLD_TIME = 2.0  # seconds
    YAWN_THRESHOLD_TIME = 2.0  # seconds
    
    # Status colors (BGR format)
    ACTIVE_COLOR = (0, 255, 0)    # Green
    DROWSY_COLOR = (0, 0, 255)    # Red
    YAWN_COLOR = (0, 255, 255)    # Yellow
    SLEEP_COLOR = (255, 0, 0)     # Blue
    
    def __init__(self):
        load_dotenv()
        self.backend_url = os.environ.get('BACKEND_URL')
        if not self.backend_url:
            logger.error("BACKEND_URL not found in environment variables")
            raise ValueError("BACKEND_URL not set in environment")
        
        self.status = "Initializing..."
        self.color = (200, 200, 200)
        self.sleep_start_time = None
        self.drowsy_start_time = None
        self.yawn_start_time = None
        self.last_alert_time = 0
        self.alert_cooldown = 30  # seconds between alerts
        
        # User data
        self.user_data = None
        self.vehicle_ip = None

        self.notification_sent = False
        self.vehicle_stopped = False
        
        self.frame_count = 0
        self.fps = 0
        self.fps_start_time = time.time()

    def compute_distance(self, ptA, ptB):
        """Calculate Euclidean distance between two points."""
        return np.linalg.norm(ptA - ptB)

    def calculate_ear(self, eye):
        """Calculate the Eye Aspect Ratio (EAR)."""
        A = self.compute_distance(eye[1], eye[5])  # Vertical distance 1
        B = self.compute_distance(eye[2], eye[4])  # Vertical distance 2
        C = self.compute_distance(eye[0], eye[3])  # Horizontal distance
        # Avoid division by zero
        if C == 0:
            return 0
        return (A + B) / (2.0 * C)

    def calculate_mar(self, mouth):
        """Calculate the Mouth Aspect Ratio (MAR)."""
        A = self.compute_distance(mouth[13], mouth[19])  # Vertical distance
        B = self.compute_distance(mouth[14], mouth[18])  # Vertical distance
        C = self.compute_distance(mouth[12], mouth[16])  # Horizontal distance
        # Avoid division by zero
        if C == 0:
            return 0
        return (A + B) / (2.0 * C)

    def authenticate(self, email, password):
        """Authenticate user with backend."""
        try:
            response = requests.post(
                f"{self.backend_url}/login-user", 
                json={'email': email, 'password': password},
                timeout=10
            )
            response.raise_for_status()
            logger.info("Authentication successful")
            return response.json()
        except requests.exceptions.RequestException as e:
            logger.error(f"Authentication failed: {e}")
            return None

    def send_drowsy_notification(self):
        """Send drowsiness notification to user through backend."""
        if self.notification_sent:
            return
        
        if not self.user_data or 'user' not in self.user_data:
            logger.warning("Cannot send notification: User not authenticated")
            return
            
        try:
            logger.info("Sending drowsiness notification")
            data = {
                'targetToken': self.user_data['user']['fcmToken'],
                'title': "Drowsiness Detected!",
                'body': "You seem drowsy. Please take a break or rest to stay safe. Tap here to check for nearby drivers.",
                'userId': self.user_data['user']['_id'],
            }
            response = requests.post(
                f"{self.backend_url}/send-drowsy-alert", 
                json=data,
                timeout=10
            )
            response.raise_for_status()
            self.notification_sent = True
            logger.info("Drowsiness notification sent successfully")
            return response.json()
        except requests.exceptions.RequestException as e:
            logger.error(f"Failed to send drowsiness notification: {e}")
            return None

    def stop_vehicle(self):
        """Stop the vehicle by sending command to ESP32."""
        if self.vehicle_stopped:
            return
        
        if not self.vehicle_ip:
            logger.warning("Cannot stop vehicle: Vehicle IP not set")
            return
            
        try:
            logger.info(f"Sending stop command to vehicle at {self.vehicle_ip}")
            vehicle_link = f'http://{self.vehicle_ip}/sleep'
            response = requests.get(vehicle_link, timeout=5)
            response.raise_for_status()
            self.vehicle_stopped = True
            logger.info("Vehicle stop command sent successfully")
        except Exception as e:
            logger.error(f"Failed to stop vehicle: {e}")

    def setup(self):
        """Initialize the camera and face detection models."""
        parser = argparse.ArgumentParser(description='Drowsiness Detection System')
        parser.add_argument('--camera', type=int, default=0, help='Camera index (default: 0)')
        parser.add_argument('--vehicle-ip', type=str, help='Vehicle IP address')
        parser.add_argument('--email', type=str, help='User email')
        parser.add_argument('--password', type=str, help='User password')
        parser.add_argument('--shape-predictor', type=str, 
                          default="shape_predictor_68_face_landmarks.dat",
                          help='Path to facial landmark predictor model')
        args = parser.parse_args()
        
        # Initialize camera with resolution optimization
        self.cap = cv2.VideoCapture(args.camera)
        self.cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
        self.cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
        
        if not self.cap.isOpened():
            logger.error("Failed to open camera")
            raise RuntimeError("Could not open camera")
            
        logger.info("Loading facial landmark predictor...")
        try:
            self.detector = dlib.get_frontal_face_detector()
            self.predictor = dlib.shape_predictor(args.shape_predictor)
            logger.info("Facial landmark predictor loaded successfully")
        except RuntimeError as e:
            logger.error(f"Failed to load facial landmark predictor: {e}")
            raise
            
        # Get vehicle IP and user credentials
        self.vehicle_ip = args.vehicle_ip if args.vehicle_ip else input("Enter vehicle IP: ")
        email = args.email if args.email else input("Enter your email: ")
        password = args.password if args.password else input("Enter your password: ")
        
        # Authenticate user
        self.user_data = self.authenticate(email, password)
        if not self.user_data:
            logger.warning("Authentication failed, proceeding without user data")

    def process_frame(self, frame):
        """Process a single frame for drowsiness detection."""
        self.frame_count += 1
        if self.frame_count % 30 == 0:
            current_time = time.time()
            self.fps = 30 / (current_time - self.fps_start_time)
            self.fps_start_time = current_time
        
        display_frame = frame.copy()
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        
        # Apply histogram equalization to improve contrast in varying lighting
        gray = cv2.equalizeHist(gray)
        
        faces = self.detector(gray)
        if len(faces) == 0:
            self.status = "No face detected"
            self.color = (0, 165, 255)  # Orange
            self.sleep_start_time = None
            self.drowsy_start_time = None
            self.yawn_start_time = None
            
            cv2.putText(display_frame, self.status, (10, 30), 
                      cv2.FONT_HERSHEY_SIMPLEX, 0.7, self.color, 2)
            cv2.putText(display_frame, f"FPS: {self.fps:.1f}", (10, 60), 
                      cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
            
            return display_frame
            
        face = faces[0]
        
        landmarks = self.predictor(gray, face)
        landmarks = face_utils.shape_to_np(landmarks)
        
        left_eye = landmarks[36:42]
        right_eye = landmarks[42:48]
        mouth = landmarks[48:68]
        
        left_ear = self.calculate_ear(left_eye)
        right_ear = self.calculate_ear(right_eye)
        avg_ear = (left_ear + right_ear) / 2.0
        mar = self.calculate_mar(mouth)
        
        current_time = time.time()
        
        if avg_ear < self.EAR_THRESHOLD_FULL:
            if self.sleep_start_time is None:
                self.sleep_start_time = current_time
                
            if current_time - self.sleep_start_time > self.SLEEP_THRESHOLD_TIME:
                self.status = "SLEEPING !!!"
                self.color = self.SLEEP_COLOR
                self.drowsy_start_time = None
                self.yawn_start_time = None
                
                threading.Thread(target=self.stop_vehicle).start()
                
        elif avg_ear < self.EAR_THRESHOLD_HALF:
            # Drowsy state
            if self.drowsy_start_time is None:
                self.drowsy_start_time = current_time
                
            if current_time - self.drowsy_start_time > self.DROWSY_THRESHOLD_TIME:
                self.status = "Drowsy !"
                self.color = self.DROWSY_COLOR
                self.sleep_start_time = None
                self.yawn_start_time = None
                
                threading.Thread(target=self.send_drowsy_notification).start()
                
        elif mar > self.MAR_THRESHOLD_YAWN:
            if self.yawn_start_time is None:
                self.yawn_start_time = current_time
                
            if current_time - self.yawn_start_time > self.YAWN_THRESHOLD_TIME:
                self.status = "Drowsy (Yawn)!"
                self.color = self.YAWN_COLOR
                self.sleep_start_time = None
                self.drowsy_start_time = None
                
        else:
            self.sleep_start_time = None
            self.drowsy_start_time = None
            self.yawn_start_time = None
            self.status = "Active :)"
            self.color = self.ACTIVE_COLOR
        
        (x, y, w, h) = (face.left(), face.top(), face.width(), face.height())
        cv2.rectangle(display_frame, (x, y), (x + w, y + h), self.color, 2)
        
        self.draw_landmarks(display_frame, left_eye, right_eye, mouth)
        
        self.draw_metrics(display_frame, avg_ear, mar)
        
        return display_frame
    
    def draw_landmarks(self, frame, left_eye, right_eye, mouth):
        """Draw facial landmarks on the frame."""
        left_eye_hull = cv2.convexHull(left_eye)
        right_eye_hull = cv2.convexHull(right_eye)
        cv2.drawContours(frame, [left_eye_hull], -1, (255, 255, 0), 1)
        cv2.drawContours(frame, [right_eye_hull], -1, (255, 255, 0), 1)
        
        mouth_hull = cv2.convexHull(mouth)
        cv2.drawContours(frame, [mouth_hull], -1, (255, 255, 0), 1)
    
    def draw_metrics(self, frame, ear, mar):
        """Draw metrics and status on the frame."""
        cv2.putText(frame, f"EAR: {ear:.2f}", (10, 30), 
                  cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
        cv2.putText(frame, f"MAR: {mar:.2f}", (10, 60), 
                  cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
        
        cv2.putText(frame, f"FPS: {self.fps:.1f}", (10, 90), 
                  cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
        
        timestamp = datetime.now().strftime("%H:%M:%S")
        status_text = f"{self.status} - {timestamp}"
        cv2.putText(frame, status_text, (10, frame.shape[0] - 20), 
                  cv2.FONT_HERSHEY_SIMPLEX, 0.7, self.color, 2)
    
    def run(self):
        try:
            logger.info("Starting drowsiness detection...")
            
            while True:
                ret, frame = self.cap.read()
                if not ret:
                    logger.error("Failed to capture frame from camera")
                    break
                
                display_frame = self.process_frame(frame)
                cv2.imshow("Drowsiness Detection", display_frame)
                
                # Check for ESC key press to exit
                key = cv2.waitKey(1) & 0xFF
                if key == 27:  # ESC key
                    logger.info("ESC key pressed, exiting...")
                    break
                
        except KeyboardInterrupt:
            logger.info("Interrupted by user")
        except Exception as e:
            logger.error(f"Error in main loop: {e}")
        finally:
            if hasattr(self, 'cap'):
                self.cap.release()
            cv2.destroyAllWindows()
            logger.info("Drowsiness detection stopped")

if __name__ == "__main__":
    try:
        detector = DrowsinessDetector()
        detector.setup()
        detector.send_drowsy_notification()
    except Exception as e:
        logger.critical(f"Fatal error: {e}")
        raise
