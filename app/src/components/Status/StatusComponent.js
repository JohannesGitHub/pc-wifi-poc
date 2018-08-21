import React from 'react'
import { View, Button, Text, StyleSheet } from 'react-native'

const StatusComponent = props => {
  return (
    <View style={styles.container}>
      <Text style={{fontSize: 18}}>{props.status}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 20
  }
})

export default StatusComponent