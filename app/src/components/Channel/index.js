import { connect } from 'react-redux';
import ChannelComponent from './ChannelComponent';

import { closeChannel, depositFunds, makePayment } from '../../services/uraidenService'

const mapStateToProps = state => {
  return {
    channel: state.uraiden.channel,
    senderBalance: state.uraiden.channel.deposit - state.uraiden.uraidenInstance.tkn2num(state.uraiden.uraidenInstance.channel.proof.balance),
    account: state.uraiden.uraidenInstance.channel.account,
    receiver: state.uraiden.uraidenInstance.channel.receiver
  }
}
const mapDispatchToProps = dispatch => {
  return {
    onCloseChannel: () => dispatch(closeChannel()),
    onDepositFunds: depositAmount => dispatch(depositFunds(depositAmount)),
    onPayment: () => dispatch(makePayment())
  }
}

const ChannelContainer = connect(
  mapStateToProps,
  mapDispatchToProps,
)(ChannelComponent)

export default ChannelContainer