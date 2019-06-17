import React from 'react';
import Sound from 'react-sound';
import Button from 'react-bootstrap/Button';
import './Game.css';
import axios from 'axios';
import update from 'immutability-helper';


class Game extends React.Component {
  state = {
    audioURLs: ["", "", ""],
    playing: [Sound.status.STOPPED, Sound.status.STOPPED, Sound.status.STOPPED],
    started: false,
    ayaatRead: 0,
    surahs: ["", "", "", "", ""],
    isSurahCorrect: [false, false, false, false, false],
    isCorrect: false,
    score: 0,
    round: 0,
    gameOver: false,
  };

  componentDidMount(){
    this.randomSurahAndAyah();
  }

  createOptions(surahOptions){
    surahOptions = Game.shuffle(surahOptions);
    console.log(surahOptions);
    this.setState({
      surahs: ["Surah "+ surahOptions[0].name, "Surah "+ surahOptions[1].name, "Surah "+ surahOptions[2].name,
        "Surah "+ surahOptions[3].name, "Surah "+ surahOptions[4].name],
      isSurahCorrect: [surahOptions[0].isCorrect, surahOptions[1].isCorrect, surahOptions[2].isCorrect,
        surahOptions[3].isCorrect, surahOptions[4].isCorrect]
    })
  }

  randomSurahAndAyah(){
    this.setState({
      ayaatRead: 0,
    });
    if (this.state.round === 10){
      this.setState({
        gameOver: true,
      });
      return
    }

    let randomSurah = Math.floor(Math.random() * 114) + 1;
    let surahOptions = [];
    
    axios.get("http://staging.quran.com:3000/api/v3/chapters").then((response) => {
      surahOptions.push({name: response.data.chapters[randomSurah - 1].name_simple, isCorrect: true,});
      for (let i=1; i<5; i++){
        surahOptions.push({name: response.data.chapters[Math.floor(Math.random() * 114)].name_simple, isCorrect: false,});
      }
    this.createOptions(surahOptions);
    });
  
    let randomSurahNo = ('000' + randomSurah).substr(-3);
    axios.get("http://api.alquran.cloud/v1/surah/" + randomSurahNo)
    .then((response) => {
      let firstAyah = Math.floor(Math.random() * (response.data.data.numberOfAyahs - 3) ) + 1;
      let firstAyahNo = ('000' + firstAyah).substr(-3);
      let secondAyah = parseInt(firstAyahNo) + 1;
      let secondAyahNo = ('000' + secondAyah).substr(-3);
      let thirdAyah = parseInt(firstAyahNo) + 2;
      let thirdAyahNo = ('000' + thirdAyah).substr(-3);
      this.setState({
        audioURLs: ["https://verses.quran.com/Alafasy/mp3/" + randomSurahNo + firstAyahNo + ".mp3",
          "https://verses.quran.com/Alafasy/mp3/" + randomSurahNo + secondAyahNo + ".mp3",
          "https://verses.quran.com/Alafasy/mp3/" + randomSurahNo + thirdAyahNo + ".mp3",],
        round: this.state.round + 1,
        ayaatRead: 1,
      })

    })
  }

  nextAyah(){
    console.log(`Ayaat read: ${this.state.ayaatRead}`);
    console.log(this.state);
    if (this.state.ayaatRead === 1){
      this.setState({
        playing: [Sound.status.STOPPED, Sound.status.PLAYING, Sound.status.STOPPED],
        ayaatRead: this.state.ayaatRead + 1,
      })
    }
    else if (this.state.ayaatRead === 2){
      this.setState({
        playing: [Sound.status.STOPPED, Sound.status.STOPPED, Sound.status.PLAYING],
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
        ayaatRead: 1,
        playing: [Sound.status.PLAYING, Sound.status.STOPPED, Sound.status.STOPPED],
      });
      this.nextRound();
    }
    else {
      this.setState({
        isCorrect: false,
      })
    }
  }

  static shuffle(a) {
    let j, x, i;
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
          <Button variant="primary" size="lg" onClick={() => this.setState({
            started: true, playing: update(this.state.playing, {0: {$set: Sound.status.PLAYING}}), ayaatRead: 1,})}>
            Start
          </Button>
        </div>
        )}

        {this.state.started && (
        <div>
          {this.state.isCorrect && (<div style={{color: 'green',}}> Correct </div>)}
          {this.state.gameOver && (<div style={{color: 'red',}}> Game Over </div>)}
          <Sound url={this.state.audioURLs[0]} autoLoad playStatus={this.state.playing[0]} onFinishedPlaying={() => this.nextAyah()}></Sound>
          <Sound url={this.state.audioURLs[1]} autoLoad playStatus={this.state.playing[1]} onFinishedPlaying={() => this.nextAyah()}></Sound>
          <Sound url={this.state.audioURLs[2]} autoLoad playStatus={this.state.playing[2]} onFinishedPlaying={() => this.nextAyah()}></Sound>
          <Button variant="outline-primary" size="lg" onClick={() => this.surahSelected(this.state.isSurahCorrect[0])}>
            {this.state.surahs[0]}
          </Button>
          <Button variant="outline-primary" size="lg" onClick={() => this.surahSelected(this.state.isSurahCorrect[1])}>
            {this.state.surahs[1]}
          </Button>
          <Button variant="outline-primary" size="lg" onClick={() => this.surahSelected(this.state.isSurahCorrect[2])}>
            {this.state.surahs[2]}
          </Button>
          <Button variant="outline-primary" size="lg" onClick={() => this.surahSelected(this.state.isSurahCorrect[3])}>
            {this.state.surahs[3]}
          </Button>
          <Button variant="outline-primary" size="lg" onClick={() => this.surahSelected(this.state.isSurahCorrect[4])}>
            {this.state.surahs[4]}
          </Button>
        </div>
        )}
      </div>
    );
  }
}

export default Game;