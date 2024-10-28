import { StyleSheet, Text, View } from "react-native";

function NotificationScreen(){
    return (
        <View style={styles.viewStyle}>
            <Text style={styles.headingStyle}>Kuruvila's Notification !!</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    viewStyle:{
        display: 'flex',
        justifyContent:'center',
        alignitems: 'center',
        flex:1,
    },

    headingStyle:{
        fontSize: 28,
        color: 'purple',
        textAlign: 'center',
    }
})


export default NotificationScreen