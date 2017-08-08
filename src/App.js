import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

var BASE_URL = 'https://glex.nathanvangheem.com/';

var http = function(url, method, callback){
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
	if (xhr.readyState === 4) {
	    if (xhr.status === 200) {
		callback(xhr);
	    } else {

	    }
	}
    };
    xhr.open(method, url, true);
    xhr.setRequestHeader("Authorization", "Basic " + btoa("root:root"));
    xhr.send();
};


class App extends Component {
    constructor(props){
	super(props);
	this.state = {
	    videos: {},
	    selectedVideo: null,
	    authToken: null
	};
    }

    componentDidMount() {
	var self = this;
	http(BASE_URL + '@videos', 'GET', function(xhr){
	    self.setState({videos: JSON.parse(xhr.responseText)});
	});
	http(BASE_URL + '@get-token', 'POST', function(xhr){
	    self.setState({authToken: xhr.responseText});
	});
    }

    selectVideo(video){
	this.setState({
	    selectedVideo: video.id
	});
    }

    render() {
	var self = this;
	var videos = [];
	Object.values(this.state.videos).forEach(function(video){
	    videos.push(<li key={video.id}><button onClick={self.selectVideo.bind(self, video)}>{video.name}</button></li>);
	});
	var selectedVideo = '';
	if(this.state.selectedVideo){
	    var url = "http://localhost:8080/@download?id=" + this.state.selectedVideo;
	    selectedVideo = (
		<div class="video-container">
		    <video key="{this.state.selectedVideo}-container"
		           id={this.state.selectedVideo} controls
		           src={url}>

		    </video>
		</div>
            );
	}
	return (
	    <div className="App">
		
		{selectedVideo}
		<ul>
		{videos}
	    </ul>
	</div>
    );
  }
}

export default App;
