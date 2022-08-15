import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Button, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Audio } from 'expo-av';
import * as Sharing from 'expo-sharing';

export default function App() {
  const [recording, setRecording] = React.useState();
  const [recordings, setRecordings] = React.useState([]);
  const [message, setMessage] = React.useState("");

  async function startRecording() {
    try {
      const permission = await Audio.requestPermissionsAsync();

      if (permission.status === "granted") {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true
        });
        
        const { recording } = await Audio.Recording.createAsync(
          Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
        );

        setRecording(recording);
      } else {
        setMessage("Please grant permission to app to access microphone");
      }
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  }

  async function stopRecording() {
    setRecording(undefined);
    await recording.stopAndUnloadAsync();

    let updatedRecordings = [...recordings];
    const { sound, status } = await recording.createNewLoadedSoundAsync();
    updatedRecordings.push({
      sound: sound,
      duration: getDurationFormatted(status.durationMillis),
      file: recording.getURI()
    });

    setRecordings(updatedRecordings);
  }

  function getDurationFormatted(millis) {
    const minutes = millis / 1000 / 60;
    const minutesDisplay = Math.floor(minutes);
    const seconds = Math.round((minutes - minutesDisplay) * 60);
    const secondsDisplay = seconds < 10 ? `0${seconds}` : seconds;
    return `${minutesDisplay}:${secondsDisplay}`;
  }

  function getRecordingLines() {
    return recordings.map((recordingLine, index) => {
      return (
        <View key={index} style={styles.row}>
          <Text style={[styles.fill,{color:'red',fontWeight:'700'}]}>Recording ( {index + 1} ) : {recordingLine.duration}</Text>
          <TouchableOpacity
          style={{borderRadius:10,height:40,width:90,backgroundColor:'blue'}}
          onPress={() => recordingLine.sound.replayAsync()} 
          >
            <Text style={{color:'whitesmoke',fontSize:19,textAlign:'center',marginTop:4}}>Play</Text>
          </TouchableOpacity>
          <TouchableOpacity
          style={{marginLeft:4,borderRadius:10,height:40,width:90,backgroundColor:'blue'}}
          onPress={() => Sharing.shareAsync(recordingLine.file)}
          >
          <Text 
          style={{color:'whitesmoke',fontSize:19,textAlign:'center',marginTop:4}}
          >
            Share
          </Text>
          </TouchableOpacity>
        </View>
      );
    });
  }

  return (
    <View style={styles.container}>
      <Text>{message}</Text>
      <TouchableOpacity 
      style={{backgroundColor:recording?'red':'green',height:150,width:150,justifyContent:'center',alignItems:'center',borderRadius:100}}
      onPress={recording ? stopRecording : startRecording}
      >
        <Text style={{color:'whitesmoke',fontSize:20}}>
          {recording ? 'Stop Recording' : 'Start Recording'}
        </Text>
      </TouchableOpacity>
      {getRecordingLines()}
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fill: {
    flex: 0.5,
    margin: 16
  }
});