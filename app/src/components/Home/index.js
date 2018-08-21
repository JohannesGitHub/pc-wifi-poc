import { connect } from 'react-redux';
import HomeComponent from './HomeComponent';

const mapStateToProps = state => {
  return {
    channel: state.uraiden.channel
  }
}
const mapDispatchToProps = dispatch => ({})

const HomeContainer = connect(
  mapStateToProps,
  mapDispatchToProps,
)(HomeComponent)

export default HomeContainer