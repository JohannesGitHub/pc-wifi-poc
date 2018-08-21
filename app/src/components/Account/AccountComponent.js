import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

const AccountComponent = props => {
  return (
    <View style={styles.container}>
      <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
        <Text style={{fontSize: 32, fontWeight: 'bold'}}>Account</Text>
        <View style={{marginLeft: 10}}>
          <Text style={{fontSize: 18, color: '#C4C4C4'}}>{props.etherBalance? props.etherBalance + ' ETH' : '...'}</Text>
        </View>
        <View style={{marginLeft: 10}}>
          <Text style={{fontSize: 18, color: '#C4C4C4'}}>{props.tknBalance? props.tknBalance + ' TKN' : '...'}</Text>
        </View>
      </View>
      <Text style={{fontSize: 18}}>{props.account? props.account : '...'}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 20
  }
})

export default AccountComponent