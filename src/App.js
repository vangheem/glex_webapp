import React, { Component } from 'react';
import './App.css';

var BASE_URL = 'https://glex.nathanvangheem.com/';

var http = function(url, method, callback, data){
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
    if(data){
        xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    }else{
	data = '';
    }
    xhr.send(data);
};


class Video {
    constructor(data){
	this.id = data['id'];
	this.title = data['filename'].split('.')[0];
	this.rated = 'Unknown';
	this.image = 'movie.png';
	this.plot = this.rating = this.length = this.year = null;
	if(data['data'] && data['data']['Response'] == 'True'){
	    data = data['data']
	    if(data['Type'] == 'movie'){
		this.title = data['Title'];
	    }
	    this.rated = data['Rated'];
	    this.rating = data['imdbRating'];
	    if(data['Poster'] && data['Poster'] != 'N/A'){
		this.image = data['Poster'];
	    }
	    this.year = data['Year'];
	    this.length = data['Runtime'];
	    this.plot = data['Plot'];
	}
    }
}

class App extends Component {
    constructor(props){
	super(props);
	this.state = {
	    videos: {},
	    selectedVideo: null,
	    editVideo: null,
	    authToken: null,
	    filter: ''
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
	window.scrollTo(0, 0);
    }

    getFilteredVideos(){
	if(!this.state.filter){
	    return Object.values(this.state.videos);
	}
	var matched = [];
	var filter = this.state.filter;
	Object.values(this.state.videos).forEach(function(video){
	    if(video.name.toLowerCase().indexOf(filter.toLowerCase()) !== -1){
		matched.push(video);
	    }
	});
	return matched;
    }

    filterChanged(e){
	this.setState({
	    filter: e.target.value
	});
    }

    editVideoClicked(video, e){
	e.preventDefault();
	this.setState({
	    editVideo: video.id
	});
    }

    saveVideoEditClicked(e){
	e.preventDefault();
    }

    closeVideoEditClicked(e){
	e.preventDefault();
	this.setState({
	    editVideo: null
	});
    }
    
    renderEditVideo(){
	var self = this;
	var styleProps = {
	    zIndex: 1003,
	    display: "block",
	    opacity: 1,
	    transform: "scaleX(1)",
	    top: "10%"
	};
	var video = this.state.videos[this.state.editVideo];
	var videoObj = new Video(video);
	var videoData = video['data'] || {};
	return (<div className="modal open" style={styleProps}>
          <div className="modal-content">
	    <h4>Edit {videoObj.title}</h4>
            <form className="col s12">
		<div className="row">
		<div className="input-field col s6">
		<input placeholder="Placeholder" id="first_name" type="text" className="validate"></input>
		<label htmlFor="first_name">First Name</label>
		</div>
		</div>
		</form>
          <div className="modal-footer">
		<a href="#!" className="modal-action modal-close waves-effect waves-red btn-flat " onClick={self.closeVideoEditClicked.bind(self)}>Close</a>
		<a href="#!" className="modal-action modal-close waves-effect waves-green btn-flat " onClick={self.saveVideoEditClicked.bind(self)}>Save</a>
          </div>
		</div>);
    }
    
    render() {
	var self = this;
	var videos = [];
	var videoGroup = [];
	var count = 0;
	this.getFilteredVideos().forEach(function(videoData){
	    var video = new Video(videoData);
	    var image = '';
	    if(video.image){
		image = <div className="card-image"><img src={video.image} alt="movie"></img></div>
	    }
	    var badges = [];
	    if(video.rating){
	        badges.push(<span className="chip">IMDB: {video.rating}</span>);
	    }
	    if(video.rated){
		badges.push(<span className="chip">{video.rated}</span>);
	    }
	    if(video.year){
		badges.push(<span className="chip">{video.year}</span>);
	    }
	    if(video.length){
		badges.push(<span className="chip">{video.length}</span>);
	    }
	    badges.push(<span className="chip"><a href="#" onClick={self.editVideoClicked.bind(self, video)}>Edit</a></span>);
	    var url = BASE_URL + "@download?id=" + video.id;
	    videoGroup.push(<div className="col s6 m3" key={video.id}>
      			    <div className="card">
			    {image}
			    <div className="card-content">
			    <span className="card-title">{video.title}</span>
			    {video.plot}
			    {badges}
			         </div>
			         <div className="card-action">
			           <a className="waves-effect waves-light btn" onClick={self.selectVideo.bind(self, video)}>Watch</a>
          			   <a className="waves-effect waves-light btn" href={url}>Download</a>
			         </div>
			      </div>
			    </div>);
	    if(videoGroup.length === 4){
		var key = "videogroup" + count;
		videos.push(<div className="row" key={key}>{videoGroup}</div>);
		videoGroup = [];
		count += 1;
	    }
	});
	if(videoGroup.length > 0){
	    var key = "videogroup" + count;
	    videos.push(<div className="row" key={key}>{videoGroup}</div>);
	}
	var selectedVideo = '';
	if(this.state.selectedVideo){
	    var url = BASE_URL + "@stream?id=" + this.state.selectedVideo;
	    selectedVideo = (
		<div className="glex-video-container">
		    <video key="{this.state.selectedVideo}-container" className="responsive-video" autoPlay
		           id={this.state.selectedVideo} controls
		           src={url}>

		    </video>
		</div>
            );
	}
	var editVideo = '';
	if(this.state.editVideo){
	    editVideo = this.renderEditVideo();
	}
	return (
	    <div className="App">
		
	    {selectedVideo}
	    {editVideo}
	    <div className="input-field col s12">
		<input id="filter" type="text" placeholder="Filter" value={this.state.filter} onChange={this.filterChanged.bind(self)}></input>
            </div>
	    {videos}
	    </div>
    );
  }
}

export default App;
