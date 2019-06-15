import React from 'react';
import Sound from 'react-sound';
import Button from 'react-bootstrap/Button';
import './Game.css';
import axios from 'axios';


class Game extends React.Component {
  state = {
    audioURL: "",
    audio2URL: "",
    audio3URL: "",
    playing: Sound.status.STOPPED,
    playing2: Sound.status.STOPPED,
    playing3: Sound.status.STOPPED,
    started: false,
    ayahNo: null,
    surahNo: null,
    ayaatRead: 0,
    surah1: "",
    surah2: "",
    surah3: "",
    surah4: "",
    surah5: "",
    isSurah1Correct: false, 
    isSurah2Correct: false, 
    isSurah3Correct: false, 
    isSurah4Correct: false, 
    isSurah5Correct: false,
    isCorrect: false,
    score: 0,
    round: 0,
    gameOver: false,
  }

  componentDidMount(){
    this.randomSurahAndAyah();
  }


  createOptions(surahOptions){
    surahOptions = this.shuffle(surahOptions)
    console.log(surahOptions);
    this.setState({
      surah1: "Surah "+ surahOptions[0].name,
      surah2: "Surah "+ surahOptions[1].name,
      surah3: "Surah "+ surahOptions[2].name,
      surah4: "Surah "+ surahOptions[3].name,
      surah5: "Surah "+ surahOptions[4].name,
      isSurah1Correct: surahOptions[0].isCorrect, 
      isSurah2Correct: surahOptions[1].isCorrect, 
      isSurah3Correct: surahOptions[2].isCorrect, 
      isSurah4Correct: surahOptions[3].isCorrect, 
      isSurah5Correct: surahOptions[4].isCorrect, 
      
    })
  }
  randomSurahAndAyah(){

    this.setState({
      ayaatRead: 0,
    })
    if (this.state.round === 10){
      this.setState({
        gameOver: true,
      })
      return
    }

    var randomSurah = Math.floor(Math.random() * 114) + 1;
    var surahOptions = [];
    
      axios.get("http://staging.quran.com:3000/api/v3/chapters")
      .then((response) => {
        surahOptions.push({name: response.data.chapters[randomSurah - 1].name_simple, isCorrect: true,});
        for (var i=1; i<5; i++){
        surahOptions.push({name: response.data.chapters[Math.floor(Math.random() * 114)].name_simple, isCorrect: false,});
      }
      this.createOptions(surahOptions);
      
      })
  
    var randomSurahNo = ('000' + randomSurah).substr(-3);
    axios.get("http://api.alquran.cloud/v1/surah/" + randomSurahNo)
    .then((response) => {
      var randomAyah = Math.floor(Math.random() * (response.data.data.numberOfAyahs - 3) ) + 1;
      var randomAyahNo = ('000' + randomAyah).substr(-3);
      var secondAyah = parseInt(randomAyahNo) + 2
      var secondAyahNo = ('000' + secondAyah).substr(-3);
      var thirdAyah = parseInt(randomAyahNo) + 3
      var thirdAyahNo = ('000' + thirdAyah).substr(-3);
      this.setState({
        surahNo: randomSurahNo,
        ayahNo: randomAyahNo,
        audioURL: "https://verses.quran.com/Alafasy/mp3/"+randomSurahNo+randomAyahNo+".mp3",
        audio2URL: "https://verses.quran.com/Alafasy/mp3/"+randomSurahNo+secondAyahNo+".mp3",
        audio3URL: "https://verses.quran.com/Alafasy/mp3/"+randomSurahNo+thirdAyahNo+".mp3",
        round: this.state.round + 1,
      })

    })
  }

  nextAyah(){
    if (this.state.ayaatRead == 1){
    this.setState({
      playing: Sound.status.STOPPED,
      playing2: Sound.status.PLAYING,
      playing3: Sound.status.STOPPED,
      ayaatRead: this.state.ayaatRead + 1,
    })
  }
  else if (this.state.ayaatRead == 2){
    this.setState({
      playing: Sound.status.STOPPED,
      playing2: Sound.status.STOPPED,
      playing3: Sound.status.PLAYING,
      ayaatRead: this.state.ayaatRead + 1,
    })
  }
  }

  nextRound(){
    this.randomSurahAndAyah()
  }

  surahSelected(isCorrect){
    if (isCorrect){
      this.setState({
        isCorrect: true,
      })
      this.nextRound();
    }
    else {
      this.setState({
        isCorrect: false,
      })
    }
  }

  shuffle(a) {
    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
    return a;
}
  
  render() {
    return (
      <div className="container">
      {!this.state.started && (
      <div>
      <Button variant="primary" size="lg" onClick={() => this.setState({started: true, playing: Sound.status.PLAYING, ayaatRead: 1,})}>
      Start
   </Button>
      </div>
      )}
      {this.state.started && (
        <div>
        {this.state.isCorrect && (
     <div style={{color: 'green',}}>Correct</div>
     )}
     {this.state.gameOver && (
      <div style={{color: 'red',}}>Game Over</div>
      )}
     <Sound url={this.state.audioURL} autoLoad playStatus={this.state.playing} onFinishedPlaying={() => this.nextAyah()}></Sound>
     <Sound url={this.state.audio2URL} autoLoad playStatus={this.state.playing2} onFinishedPlaying={() => this.nextAyah()}></Sound>
     <Sound url={this.state.audio3URL} autoLoad playStatus={this.state.playing3} onFinishedPlaying={() => this.nextAyah()}></Sound>
    <Button variant="outline-primary" size="lg" onClick={() => this.surahSelected(this.state.isSurah1Correct)}>
     {this.state.surah1}
   </Button>
   <Button variant="outline-primary" size="lg" onClick={() => this.surahSelected(this.state.isSurah2Correct)}>
     {this.state.surah2}
   </Button>
   <Button variant="outline-primary" size="lg" onClick={() => this.surahSelected(this.state.isSurah3Correct)}>
     {this.state.surah3}
   </Button>
   <Button variant="outline-primary" size="lg" onClick={() => this.surahSelected(this.state.isSurah4Correct)}>
     {this.state.surah4}
   </Button>
   <Button variant="outline-primary" size="lg" onClick={() => this.surahSelected(this.state.isSurah5Correct)}>
     {this.state.surah5}
   </Button>
   </div>
   )}
     </div>
    );
  }
}

export default Game;