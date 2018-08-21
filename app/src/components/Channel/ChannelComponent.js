import React, { Component } from 'react'
import { View, TouchableOpacity, Text, Image, TextInput, ActivityIndicator, StyleSheet } from 'react-native'

class ChannelComponent extends Component {

  constructor() {
    super()
    this.state = { depositAmount: '10', loadingDeposit: false, loadingCloseChannel: false }
  }

  handleDeposit = () => {
    this.setState({ loadingDeposit: true })
    this.props.onDepositFunds(Number(this.state.depositAmount))
    .then(() => this.setState({ loadingDeposit: false }))
    .catch(() => { this.setState({ loadingDeposit: false }) })
  }

  handleCloseChannel = () => {
    this.setState({ loadingCloseChannel: true })
    this.props.onCloseChannel()
    .catch(() => { this.setState({ loadingCloseChannel: false}) })
  }

  handlePayment = () => {
    this.props.onPayment()
    .catch(() => {})
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <View>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Text style={{fontSize: 24}}>deposit</Text>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <TextInput 
                  value={this.state.depositAmount} 
                  onChangeText={text => this.setState({depositAmount: text})}
                  returnKeyType={'done'}
                  keyboardType={'numeric'}
                  style={[styles.segment, {marginLeft: 10, marginRight: 10, fontSize: 24, width: 80, textAlign: 'right'}]}>
                </TextInput>
                <Text style={{fontSize: 24}}>TKN</Text>
              </View>
            </View>
            <Text style={{fontSize: 24}}>into channel</Text>
          </View>
          <View style={{marginLeft: 25}}>
          {
            this.state.loadingDeposit? (
              <View style={{}}><ActivityIndicator size='small' color='black'/></View>
            ) 
            : (
              <TouchableOpacity onPress={this.handleDeposit}>
                <Image source={require('../../assets/images/deposit.png')}></Image>
              </TouchableOpacity>
            )
          }
          </View>
        </View>
        <View style={{flexDirection: 'row', alignItems: 'baseline'}}>
          <Text style={{fontSize: 90, fontWeight: 'bold', color: '#50E3C2'}}>{this.props.senderBalance}</Text>
          <Text style={{fontSize: 48, paddingBottom: 10, color: '#C4C4C4'}}>TKN</Text>
        </View>
        <Text style={{fontSize: 24, fontWeight: 'bold'}}>Receiver:</Text>
        <Text style={{fontSize: 18}}>{this.props.receiver}</Text>
        <View style={{height: 20}}></View>
        { 
          this.state.loadingCloseChannel? (
            <View style={styles.button}><ActivityIndicator size='small' color='white'/></View>
          )
          : (
            <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
              <TouchableOpacity title='Close Channel' onPress={this.handleCloseChannel} style={[styles.button, {width: '75%', marginRight: 10}]}>
                <Text style={{color: 'white', fontSize: 18, fontWeight: 'bold'}}>Close Channel</Text>
              </TouchableOpacity>
              <TouchableOpacity title='Pay' onPress={this.handlePayment} style={[styles.button, {backgroundColor: '#C4C4C4'}]}>
                <Text style={{color: 'white', fontSize: 18, fontWeight: 'bold'}}>Pay</Text>
              </TouchableOpacity>
            </View>
          ) 
        }
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    padding: 20
  },
  segment: {
    borderColor: '#C4C4C4',
    borderWidth: 1,
    borderRadius: 8,
    padding: 4,
    margin: 4
  },
  button: {
    backgroundColor: '#F88963',
    alignItems: 'center',
    padding: 15,
    borderRadius: 8
  }
})

export default ChannelComponent