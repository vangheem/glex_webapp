import './App.css';

import React, { Component } from 'react';

var BASE_URL = 'https://glex.nathanvangheem.com/';
//var BASE_URL = 'http://localhost:8080/';


var getObjectValues = function(ob){
	if(!Object.values){
		var vals = Object.keys(this).map(function(key) {
			return this[key];
		});
		return vals;
	}
	return Object.values(ob);
}


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
	if(data['data'] && data['data']['Response'] === 'True'){
	    data = data['data']
	    if(data['Type'] === 'movie'){
			this.title = data['Title'];
	    }
	    this.rated = data['Rated'];
	    this.rating = data['imdbRating'];
	    if(data['Poster'] && data['Poster'] !== 'N/A'){
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

    selectVideo(video, e){
	e.preventDefault();
	this.setState({
	    selectedVideo: video.id
	});
	window.scrollTo(0, 0);
    }

    getFilteredVideos(){
	if(!this.state.filter){
	    return getObjectValues(this.state.videos);
	}
	var matched = [];
	var filter = this.state.filter;
	getObjectValues(this.state.videos).forEach(function(video){
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
	var self = this;
	var video = this.state.videos[this.state.editVideo];
	var videoData = video['data'] || {};
	videoData['Response'] = 'True';
	if(videoData.Type === undefined){
	    videoData.Type = 'movie';
	}
	['Actors', 'Awards', 'Country', 'Director', 'Genre', 'Language', 'Metascore', 'Plot', 'Poster', 'Rated', 'Ratings',
	 'Released', 'Response', 'Runtime', 'Title', 'Type', 'Writer', 'Year', 'imdbID', 'imdbRating', 'imdbVotes', 'totalSeasons'].forEach(function(fieldName){
	     if(videoData[fieldName] === undefined){
		 videoData[fieldName] = '';
	     }
	 });

	http(BASE_URL + '@edit-data', 'POST', function(xhr){
	    self.setState({
		editVideo: null
	    });
	}, JSON.stringify({
	    id: this.state.editVideo,
	    data: videoData
	}));
    }

    closeVideoEditClicked(e){
	e.preventDefault();
	this.setState({
	    editVideo: null
	});
    }

    editVideoField(name, e){
		var video = this.state.videos[this.state.editVideo];
		var videoData = video['data'] || {};
		videoData[name] = e.target.value;
		video['data'] = videoData;
		this.forceUpdate();
    }
    
    renderEditVideo(){
	var self = this;
	var styleProps = {
	    zIndex: 1003,
	    display: "block",
	    opacity: 1,
	    transform: "scaleX(1)",
	    top: "0",
	    maxHeight: "100%"
	};
	var video = this.state.videos[this.state.editVideo];
	var videoObj = new Video(video);
	var videoData = video['data'] || {};
	if(!videoData.Type){
	    videoData.Type = 'movie';
	}
	return (<div className="modal open" style={styleProps}>
          <div className="modal-content">
	    <h4>Edit {videoObj.title}</h4>
            <form className="col s12">
		<div className="row">
		<div className="col s3">
		<label htmlFor="edit-title">Title</label>
		</div>
		<div className="col s9">
		<input id="edit-title" placeholder="Title" type="text" value={videoData.Title} onChange={self.editVideoField.bind(self, 'Title')}></input>
		</div>
		</div>

		<div className="row">
		<div className="col s3">
		<label htmlFor="edit-plot">Plot</label>
		</div>
		<div className="col s9">
		<input id="edit-plot" placeholder="Plot" type="text" value={videoData.Plot} onChange={self.editVideoField.bind(self, 'Plot')}></input>
		</div>
		</div>

		<div className="row">
		<div className="col s3">
		<label htmlFor="edit-year">Year</label>
		</div>
		<div className="col s9">
		<input id="edit-year" placeholder="Year" type="text" value={videoData.Year} onChange={self.editVideoField.bind(self, 'Year')}></input>
		</div>
		</div>

		<div className="row">
		<div className="col s3">
		<label htmlFor="edit-rated">Rated</label>
		</div>
		<div className="col s9">
		<input id="edit-rated" placeholder="Rated" type="text" value={videoData.Rated} onChange={self.editVideoField.bind(self, 'Rated')}></input>
		</div>
		</div>

		<div className="row">
		<div className="col s3">
		<label htmlFor="edit-type">Type</label>
		</div>
		<div className="col s9">
		<input id="edit-type" placeholder="Type" type="text" value={videoData.Type} onChange={self.editVideoField.bind(self, 'Type')}></input>
		</div>
		</div>

		<div className="row">
		<div className="col s3">
		<label htmlFor="edit-poster">Poster</label>
		</div>
		<div className="col s9">
		<input id="edit-poster" placeholder="Poster" type="text" value={videoData.Poster} onChange={self.editVideoField.bind(self, 'Poster')}></input>
		</div>
		</div>

		<div className="row">
		<div className="col s3">
		<label htmlFor="edit-imdb">IMDB Rating</label>
		</div>
		<div className="col s9">
		<input id="edit-imdb" placeholder="IMDB Rating" type="text" value={videoData.imdbRating} onChange={self.editVideoField.bind(self, 'imdbRating')}></input>
		</div>
		</div>

		<div className="row">
		<div className="col s3">
		<label htmlFor="edit-runtime">Runtime</label>
		</div>
		<div className="col s9">
		<input id="edit-runtime" placeholder="Runtime" type="text" value={videoData.Runtime} onChange={self.editVideoField.bind(self, 'Runtime')}></input>
		</div>
		</div>
		
		</form>
	</div>
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
	        badges.push(<span key="imdb" className="chip">IMDB: {video.rating}</span>);
	    }
	    if(video.rated){
			badges.push(<span key="rated" className="chip">{video.rated}</span>);
	    }
	    if(video.year){
			badges.push(<span key="year" className="chip">{video.year}</span>);
	    }
	    if(video.length){
			badges.push(<span key="length" className="chip">{video.length}</span>);
	    }
	    badges.push(<span key="edit" className="chip">
			<a onClick={self.editVideoClicked.bind(self, video)}>Edit</a>
		</span>);
	    var url = BASE_URL + "@download?id=" + video.id;
	    videoGroup.push(<div className="col s6 m3" key={video.id}>
      			    <button href="#" className="card grey darken-4" onClick={self.selectVideo.bind(self, video)}>
			    {image}
			    <div className="card-content white-text">
			    <span className="card-title">{video.title}</span>
			    {video.plot}
			    {badges}
			         </div>
			         <div className="card-action">
			           <a className="waves-effect waves-light btn" onClick={self.selectVideo.bind(self, video)}>Watch</a>
          			   <a className="waves-effect waves-light btn" href={url}>Download</a>
			         </div>
			      </button>
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
