import React, { Component } from 'react'
import { View, TouchableOpacity, Text, TextInput, ActivityIndicator, StyleSheet } from 'react-native'

class ConfigChannelComponent extends Component {

  constructor() {
    super()
    this.state = { depositAmount: '1', loading: false }
  }

  handleSubmit = () => {
    this.setState({ loading: true })

    this.props.onOpenChannel(Number(this.state.depositAmount))
    .catch(() => { this.setState({ loading: false }) })
  }

  render() {
    return (
      <View style={styles.container}>
        <View>
            <Text style={{fontSize: 24}}>deposit initial amount</Text>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <TextInput 
                value={this.state.depositAmount} 
                onChangeText={text => this.setState({depositAmount: text})}
                editable={true} 
                maxLength={10} 
                keyboardType={'numeric'}
                returnKeyType={'done'}
                style={styles.input}></TextInput>
              <Text style={{fontSize: 24, fontWeight: 'bold', marginLeft: 10}}>TKN</Text>
            </View>
        </View>
        <View style={{height: 20}}></View>
        <Text style={{fontSize: 24, fontWeight: 'bold'}}>Receiver:</Text>
        <Text style={{fontSize: 18}}>{ this.props.receiver }</Text>
        <View style={{height: 20}}></View>
        { 
          this.state.loading? (
            <View style={styles.button}><ActivityIndicator size='small' color='white'/></View>
          )
          : (
            <TouchableOpacity title='Open Channel' onPress={this.handleSubmit} style={styles.button}>
              <Text style={{color: 'white', fontSize: 18, fontWeight: 'bold'}}>Open Channel</Text>
            </TouchableOpacity>
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
  },
  input: {
    fontSize: 24,
    textAlign: 'right',
    padding: 10,
    marginTop: 10,
    marginBottom: 10,
    borderColor: '#C4C4C4', 
    borderWidth: 1,
    borderRadius: 8,
    minWidth: 150
  }
})

export default ConfigChannelComponent