import cv2
import numpy as np
import dlib
from imutils import face_utils
import time

# Initialize camera
cap = cv2.VideoCapture(0)

# Load face detector and facial landmark predictor
detector = dlib.get_frontal_face_detector()
predictor = dlib.shape_predictor("shape_predictor_68_face_landmarks.dat")

# Thresholds and counters
EAR_THRESHOLD_HALF = 0.25
EAR_THRESHOLD_FULL = 0.21
MAR_THRESHOLD_YAWN = 0.6
DROWSY_THRESHOLD_TIME = 2  # seconds
SLEEP_THRESHOLD_TIME = 2  # seconds
YAWN_THRESHOLD_TIME = 2  # seconds
status = ""
color = (0, 0, 0)
sleep_start_time = None
drowsy_start_time = None
yawn_start_time = None

def compute(ptA, ptB):
    """Calculate Euclidean distance between two points."""
    return np.linalg.norm(ptA - ptB)

def calculate_ear(eye):
    """Calculate the Eye Aspect Ratio (EAR)."""
    A = compute(eye[1], eye[5])  # Vertical distance 1
    B = compute(eye[2], eye[4])  # Vertical distance 2
    C = compute(eye[0], eye[3])  # Horizontal distance
    return (A + B) / (2.0 * C)

def calculate_mar(mouth):
    """Calculate the Mouth Aspect Ratio (MAR)."""
    A = compute(mouth[13], mouth[19])  # Vertical distance
    B = compute(mouth[14], mouth[18])  # Vertical distance
    C = compute(mouth[12], mouth[16])  # Horizontal distance
    return (A + B) / (2.0 * C)

while True:
    # Capture frame from camera
    ret, frame = cap.read()
    if not ret:
        print("Failed to capture frame from camera. Exiting...")
        break

    # Convert to grayscale
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

    # Detect faces
    faces = detector(gray)
    for face in faces:
        landmarks = predictor(gray, face)
        landmarks = face_utils.shape_to_np(landmarks)

        # Extract eye and mouth regions
        left_eye = landmarks[36:42]
        right_eye = landmarks[42:48]
        mouth = landmarks[48:68]

        # Calculate EAR and MAR
        left_ear = calculate_ear(left_eye)
        right_ear = calculate_ear(right_eye)
        avg_ear = (left_ear + right_ear) / 2.0
        mar = calculate_mar(mouth)

        # Get current time for timing checks
        current_time = time.time()

        # Check EAR thresholds for states
        if avg_ear < EAR_THRESHOLD_FULL:
            if sleep_start_time is None:
                sleep_start_time = current_time
            if current_time - sleep_start_time > SLEEP_THRESHOLD_TIME:
                status = "SLEEPING !!!"
                color = (255, 0, 0)
                drowsy_start_time = None
                yawn_start_time = None
        elif avg_ear < EAR_THRESHOLD_HALF:
            if drowsy_start_time is None:
                drowsy_start_time = current_time
            if current_time - drowsy_start_time > DROWSY_THRESHOLD_TIME:
                status = "Drowsy !"
                color = (0, 0, 255)
                sleep_start_time = None
                yawn_start_time = None
        elif mar > MAR_THRESHOLD_YAWN:
            if yawn_start_time is None:
                yawn_start_time = current_time
            if current_time - yawn_start_time > YAWN_THRESHOLD_TIME:
                status = "Drowsy (Yawn)!"
                color = (0, 255, 255)
                sleep_start_time = None
                drowsy_start_time = None
        else:
            sleep_start_time = None
            drowsy_start_time = None
            yawn_start_time = None
            status = "Active :)"
            color = (0, 255, 0)

        # Draw landmarks for debugging
        for (x, y) in left_eye:
            cv2.circle(frame, (x, y), 1, (255, 255, 255), -1)
        for (x, y) in right_eye:
            cv2.circle(frame, (x, y), 1, (255, 255, 255), -1)
        for (x, y) in mouth:
            cv2.circle(frame, (x, y), 1, (255, 255, 255), -1)

        # Display EAR and MAR values for debugging
        cv2.putText(frame, f"EAR: {avg_ear:.2f}", (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
        cv2.putText(frame, f"MAR: {mar:.2f}", (10, 60), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)

    # Display status on the frame
    cv2.putText(frame, status, (10, 90), cv2.FONT_HERSHEY_SIMPLEX, 1, color, 2)

    # Show the frame
    cv2.imshow("Drowsiness Detection", frame)

    # Exit loop when 'ESC' is pressed
    if cv2.waitKey(1) & 0xFF == 27:
        break

# Release resources
cap.release()
cv2.destroyAllWindows()
