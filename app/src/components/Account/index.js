import { connect } from 'react-redux';
import AccountComponent from './AccountComponent';

const mapStateToProps = state => {
  return {
    tknBalance: state.uraiden.tknBalance,
    etherBalance: state.web3.etherBalance,
    account: state.web3.account
  }
}
const mapDispatchToProps = dispatch => ({})

const AccountContainer = connect(
  mapStateToProps,
  mapDispatchToProps,
)(AccountComponent)

export default AccountContainer