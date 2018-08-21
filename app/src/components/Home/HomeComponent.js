import React from 'react'
import { View, Button, Text, ActivityIndicator, StyleSheet } from 'react-native'

import StatusContainer from '../Status'
import AccountContainer from '../Account'
import ChannelContainer from '../Channel'
import ConfigChannelContainer from '../ConfigChannel'

const HomeComponent = props => {
  return (
    <View style={styles.container}>
      <View style={{}}>
        <StatusContainer/>
      </View>
      <View style={styles.segment}>
        <AccountContainer/>
      </View>
      <View style={[styles.segment, {}]}>
        { props.channel === null? (<ActivityIndicator size='small' color='black' style={{padding: 20}}/>) 
          : (props.channel['state'] === 'opened' ? (<ChannelContainer />) : (<ConfigChannelContainer />))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 40,
  },
  segment: {
    borderColor: '#C4C4C4',
    borderWidth: 1,
    borderRadius: 8,
    margin: 15
  }
})

export default HomeComponent