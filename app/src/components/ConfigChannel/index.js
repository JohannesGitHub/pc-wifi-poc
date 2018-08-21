import { connect } from 'react-redux';
import ConfigChannelComponent from './ConfigChannelComponent';

import { openChannel } from '../../services/uraidenService'

const mapStateToProps = state => ({
  account: state.uraiden.uraidenInstance.channel.account,
  receiver: state.uraiden.uraidenInstance.channel.receiver
})
const mapDispatchToProps = dispatch => {
  return {
    onOpenChannel: depositAmount => dispatch(openChannel(depositAmount))
  }
}

const ConfigChannelContainer = connect(
  mapStateToProps,
  mapDispatchToProps,
)(ConfigChannelComponent)

export default ConfigChannelContainer