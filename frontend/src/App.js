import React, { Component } from 'react';
import TwitterLogin from 'react-twitter-auth';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import axios from 'axios';

class App extends Component {

  constructor() {
    super();
    this.state = { isAuthenticated: false, user: null, token: '',  appName: "Twitter App",};
  }

//on successful authentication
  onSuccess = (response) => {
    console.log("success ",response);
    const token = response.headers.get('x-auth-token');
    response.json().then(user => {
      if (token) {
        console.log("User is ",user)
        this.setState({isAuthenticated: true, user: user, token: token});
      }
    });
  };

// on failed authentication
  onFailed = (error) => {
    alert(error);
  };

//when user logs out
  logout = () => {
    this.setState({isAuthenticated: false, token: '', user: null})
  };

//search tweets by hash tag
  searchTweets = (e) => {
    var hash =  document.getElementById("searchByHash").value ;
    console.log("Hash value ",hash);
    document.getElementById("hash").innerHTML = "";
    axios.get('http://localhost:4000/searchByHashTag',{
     
      params: {key:hash}
     })
    .then(response => {
        console.log(response.data);
        for (var x =0; x < response.data.length; x++){
          document.getElementById("hash").innerHTML += response.data[x]+'<br>';
        }
    })
    .catch(error => {
        console.log(error.response);
    })
  }

//search tweets by location
  searchLocation = (e) => {
    var hash =  document.getElementById("searchByLoc").value ;
    console.log("Hash value ",hash);
    document.getElementById("location").innerHTML = "";
    axios.get('http://localhost:4000/searchByLocation',{
     
      params: {key:hash}
     })
    .then(response => {
        console.log(response.data);
        for (var x =0; x < response.data.length; x++){
          document.getElementById("location").innerHTML += response.data[x]+'<br>';
        }
    })
    .catch(error => {
        console.log(error.response);
    })
    
  }

  render() {
    
    var style = {
      marginLeft:'45%'
    };
    let content = !!this.state.isAuthenticated ?
      (
        <div>
            <AppBar position="static">
            <Toolbar>
            <Typography variant="h5" color="inherit" style={style}>
               Twitter Application
            </Typography>
            </Toolbar>
            </AppBar>
            <h4 style={style}>
            Welcome {this.state.user.email}
            </h4>
            <div>
            <label style={style}> Search for Tweets by HashTag</label>
            <TextField
                id="searchByHash"
                label="Search field"
                type="search"
                margin="normal"
                style={style}
              />
              </div>
              <p id="hash" style={style}></p>
               <Button variant="contained" color="primary" onClick={this.searchTweets} style={{marginLeft:"45%"}}>
              Search
              </Button>
              <div>
                <br></br>
            <label style={{marginLeft:"45%"}}> Search for Tweets by location</label>
            <TextField
                id="searchByLoc"
                label="Search field"
                type="search"
                margin="normal"
                style={style}
              />
              </div>
              <p id="location" style={style}></p>
               <Button variant="contained" color="primary" onClick={this.searchLocation} style={{marginLeft:"45%",marginTop:"5%"}}>
              Search
              </Button>
              <Button variant="contained" color="primary" onClick={this.logout} style={{marginLeft:"15%",marginTop:"-40%"}}>
              Log out
              </Button>
            
        </div>
      ) :
      (
        <div>
          <AppBar position="static">
            <Toolbar>
            <Typography variant="h5" color="inherit" style={style}>
               Twitter Application
            </Typography>
            </Toolbar>
            </AppBar>
            <h2>Please Sign In to continue...
            </h2>
            <br></br>
            <br></br>
        <TwitterLogin loginUrl="http://localhost:4000/api/v1/auth/twitter"
                      onFailure={this.onFailed} onSuccess={this.onSuccess}
                      requestTokenUrl="http://localhost:4000/api/v1/auth/twitter/reverse"
                      style={style}/>
    
        </div>
        
      );

    return (
      <div className="App">
        {content}
      </div>
    );
  }
}

export default App;
