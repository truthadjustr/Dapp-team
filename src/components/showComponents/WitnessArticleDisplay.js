import React, { Component } from "react";
import {Grid, Row, Col, Jumbotron, Label, Media, Button} from "react-bootstrap";
import contract from 'truffle-contract';
import web3 from '../../web3';
import VotingContract from '../../../build/contracts/Voting.json';
import { Redirect, withRouter, Link } from 'react-router-dom';

import {bindActionCreators} from 'redux';
import { connect } from 'react-redux';

class WitnessArticle extends Component {
  constructor(props) {
    super(props);
    this.state = {
      myData: {
        desc: '',
        title: '',
        url: '',
        image: ''
      },
      researcherData: {
        sources: '',
        comments: '',
        score: ''
      },
      verifierData: {
        sources: '',
        comments: '',
        score: ''
      },
      ipfshashes: {
        task: '',
        research: '',
        verifier: ''
      }
    }
  }

  fetchIPFS = () => {
    fetch(`https://gateway.ipfs.io/ipfs/${this.state.ipfshashes.task}`)
      .then(resp => {
        if (!resp.ok) {
          throw Error('oops: ', resp.message);
        }
        return resp.json();
      })
      .then(data => {
        this.setState({
          myData: {
            desc: data.myData.description,
            title: data.myData.title,
            url: data.myData.url,
            image: data.myData.image
          }
        })
      })
      .catch(err => console.log(`error: ${err}`))
  };
  fetchIPFSResearcher = () => {
    fetch(`https://gateway.ipfs.io/ipfs/${this.state.ipfshashes.research}`)
      .then(resp => {
        if (!resp.ok) {
          throw Error('oops: ', resp.message);
        }
        return resp.json();
      })
      .then(data => {
        this.setState({
          researcherData: {
            sources: data.researcherData.source,
            comments: data.researcherData.comments,
            score: data.researcherData.score
          }
        })
      })
      .catch(err => console.log(`error: ${err}`))
  };

  getChallengeId = () => {
    this.props.trive.triveContract.taskIdToChallengeId(this.props.match.params.id)
    .then(res => {
      this.props.trive.triveContract.challenges(res.c[0])
      .then(res => {
        this.fetchIPFSVerifier(res[1]);
      })
      .catch(err => {
        console.log(err)
      })
    })
    .catch(err => {
      console.log(err)
    })
  }

  fetchIPFSVerifier = (hash) => {
    fetch(`https://gateway.ipfs.io/ipfs/${hash}`)
      .then(resp => {
        if (!resp.ok) {
          throw Error('oops: ', resp.message);
        }
        return resp.json();
      })
      .then(data => {
        this.setState({
          verifierData: {
            sources: data.researcherData.source,
            comments: data.researcherData.comments,
            score: data.researcherData.score
          }
        })
      })
      .catch(err => console.log(`error: ${err}`))
  };
  getTaskInfo = () => {
    this.props.trive.triveContract.tasks(this.props.match.params.id)
    .then((result) => {
      this.setState({
        ipfshashes: {
          task: result[0],
          research: result[1]
        }
      })
      this.fetchIPFS();
      this.fetchIPFSResearcher();
      this.getChallengeId();
    }).catch((error) => {
      console.log(error)
    })
  }

  vote = (pref) => {
    this.props.trive.triveContract.witnessChallenge(this.props.match.params.id, pref, {from: this.props.account, gas: 6654755})
    .then(res => {
      console.log(res);
    })
    .catch(err => {
      console.log(err);
    })
  }


  componentDidMount() {
    if (this.props.trive.isloaded){this.getTaskInfo()};
  }

  render() {
    const { desc, title, url } = this.state.myData;
    const { sources, comments, score } = this.state.researcherData;
    return (
      <div>
        <Grid className="dash-row">
          <Row className="show-grid">
            <Col sm={12} >
              Original task
              <Jumbotron>
                <h1>{title}</h1>
                <img src={`data:image/jpeg;base64,${this.state.myData.image}`} className='showImage' alt=""/>

                <p>
                  Description of the problem: <br />
                  {desc}
                </p>
                <Button bsStyle="primary" href={url} target="_blank">Link to the article</Button>
              </Jumbotron>
            </Col>
          </Row>

          <Row className="show-grid">
            <Col sm={6} >
              <h1>LEFT RESEARCH OF ARTICLE: {this.props.match.params.id}</h1>
              <Jumbotron>
                <p>Comments: {comments} </p>
                <p>Score: {score}%</p>
                <p>Source: {sources}</p>
                {this.props.curUserInfo.rank >= 1 && <Button bsStyle="danger" onClick={() => this.vote(false)} >Vote for this research</Button>}
              </Jumbotron>
            </Col>
            <Col sm={6}  className="dash-content">
              <h1>RIGHT RESEARCH OF ARTICLE {this.props.match.params.id}</h1>
              <Jumbotron>
                <p>Comments:  {this.state.verifierData.comments}</p>
                <p>Score:  {this.state.verifierData.score}%</p>
                <p>Source: {this.state.verifierData.sources} </p>
                {this.props.curUserInfo.rank >= 1 && <Button bsStyle="danger" onClick={() => this.vote(true)} >Vote for this research</Button>}
              </Jumbotron>
            </Col>
          </Row>
        </Grid>
      </div>
    )
  }
}

const mapStateToProps = (state) => {
	return ({
    curUserInfo: state.currentUserInfo.curUserInfo,
    account: state.trive.account,
    trive: state.trive.contracts
  //activeAccount: state.web3.activeAccount
})
};

export default withRouter(connect(mapStateToProps)(WitnessArticle));
