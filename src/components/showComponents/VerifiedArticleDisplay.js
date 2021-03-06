import React, { Component } from "react";
import {Jumbotron, Label, Media, Button} from "react-bootstrap";
import contract from 'truffle-contract';
import web3 from '../../web3';

import {bindActionCreators} from 'redux';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

class VerifiedArticleDisplay extends Component {
  constructor(props) {
    super(props);
    this.state ={
      taskData: {
        desc: "",
        title: "",
        url: "",
        image: ''
      },
      taskInfo: {
        ipfsTaskHash: "",
        ipfsResearchHash: "",
        reward: ""
      },
      researcherData: {
        source: '',
        comments: '',
        score: ''
      },
      zoomInActive: false
    }
    // this.fetchIPFS = this.fetchIPFS.bind(this);
    // this.getTaskInfo = this.getTaskInfo.bind(this);
  }
  fetchTaskIPFS = () => {
    fetch(`https://gateway.ipfs.io/ipfs/${this.state.taskInfo.ipfsTaskHash}`)
      .then(resp => {
        if (!resp.ok) {
          throw Error('oops: ', resp.message);
        }
        return resp.json();

      })
      .then(data => {
        this.setState({
          taskData: {
            desc: data.myData.description,
            title: data.myData.title,
            url: data.myData.url,
            image: data.myData.image
          }
        })
      })
      .catch(err => console.log(`error: ${err}`))
  };
  fetchResearchIPFS = () => {
    fetch(`https://gateway.ipfs.io/ipfs/${this.state.taskInfo.ipfsResearchHash}`)
      .then(resp => {
        if (!resp.ok) {
          throw Error('oops: ', resp.message);
        }
        return resp.json();

      })
      .then(data => {
        this.setState({
          researcherData: {
            source: data.researcherData.source,
            comments: data.researcherData.comments,
            score: data.researcherData.score
          }
        })
      })
      .catch(err => console.log(`error: ${err}`))
  };

  getTaskInfo = () => {
    this.props.trive.triveContract.methods
    .tasks(this.props.articleId)
    .call()
    .then((result) => {
      console.log(result)
      this.setState({
        taskInfo: {
          ipfsTaskHash: result[0],
          ipfsResearchHash: result[1],
          reward: result[2]
        }
      })
      this.fetchTaskIPFS();
      this.fetchResearchIPFS();
    }).catch((error) => {
      console.log(error)
    })
  };

  zoomInFunc = () => {
    this.setState({zoomInActive: !this.state.zoomInActive})
  }
  componentDidMount() {
    this.getTaskInfo();
  }

  render() {
    const style = {
      'text-align': 'left',
      'border-bottom': '0.5px solid #fff'
    }
    const styleJum = {
      'text-align': 'left',

    }
    const zoomIn = (<Jumbotron style={styleJum} onClick={this.zoomInFunc}>
      <h1>{this.state.taskData.title}</h1>
      <img src={this.state.taskData.image} className='showImage' alt=""/>
      <p>
        Description of the problem: <br />
        {this.state.taskData.desc}
      </p>
      <p>Source: <br /> {this.state.researcherData.source}</p>
      <p>Comments: <br /> {this.state.researcherData.comments}</p>
      <p>Score: <br /> {this.state.researcherData.score}% <Button bsStyle="primary" href={this.state.taskData.url} target="_blank">Link to the article</Button></p>
    </Jumbotron>);
    const listItem = (<Media style={style} className='article-intro' onClick={this.zoomInFunc}>
      <Media.Left>
        <img width={64} height={64} src={this.state.taskData.image} alt="thumbnail" />
      </Media.Left>
      <Media.Body>
        <Media.Heading>{this.state.taskData.title}</Media.Heading>
        <p>
          Description of the problem: <br />
          {this.state.taskData.desc}
        </p>
      </Media.Body>
    </Media>)
    return (
      <div>
        {this.state.zoomInActive && zoomIn}
        {!this.state.zoomInActive && listItem}
      </div>
    );
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
export default withRouter(connect(mapStateToProps)(VerifiedArticleDisplay));
