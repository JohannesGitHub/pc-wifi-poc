import { connect } from 'react-redux';
import StatusComponent from './StatusComponent';

const mapStateToProps = state => {
  return {
    status: state.uraiden.status
  }
}
const mapDispatchToProps = dispatch => ({})

const StatusContainer = connect(
  mapStateToProps,
  mapDispatchToProps,
)(StatusComponent)

export default StatusContainer