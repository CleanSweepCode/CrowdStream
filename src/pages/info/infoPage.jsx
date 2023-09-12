import React from 'react';
import './infoPage.css'; // Importing your CSS
import { Lynch, Parish, Mayhew, Boyne } from '../../assets/images'
import { useNavigate } from "react-router-dom";
import IconButton from '@material-ui/core/IconButton';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';

const InfoPage = () => {
  const navigate = useNavigate();

  return (

    <div className="infoPage">

      <div className="streamerplayer-backButton">
        <IconButton edge="start" color="inherit" aria-label="back" onClick={async () => {
          navigate('/');
        }}>
          <ArrowBackIcon />
        </IconButton>
      </div>

      <h1>What is <span className="CSFont">
        <span className="CSBlack">Crowd</span>
        <span className="CSRed">Stream</span>
      </span>?</h1>
      <section id="what-is">
        <p>
          CrowdStream is a platform that democratizes live streaming. Livestreaming local events can be costly, ineffective, and difficult to set up. CrowdStream aims to solve these problems by allowing anyone to stream an event from their phone, and allowing anyone to watch that stream from their phone.
        </p>
      </section>

      <h1>How do I get started?</h1>
      <section id="get-started">
        <p><b>To watch a stream:</b> Simply click on a pin on the map!</p>
        <p><b>To stream:</b> Click on the streamer icon in the top right corner of the screen. You will be prompted to allow CrowdStream to access your camera and microphone. Once you allow access, you will be able to start streaming!</p>
      </section>

      {<h1>The Team</h1>}
      <section id="team">
        <div className="team-grid">
          <div className="team-member">
            <img src={Lynch} alt="Tom Lynch" />
            <strong>Tom Lynch</strong>
            <p>PhD Student in Biomechanical Engineering at Cambridge</p>
          </div>

          <div className="team-member">
            <img src={Parish} alt="Ollie Parish" />
            <strong>Ollie Parish</strong>
            <p>MEng in Information Engineering and Machine Learning at Cambridge</p>
          </div>

          <div className='team-member'>
            <img src={Mayhew} alt="Nick Mayhew" />
            <strong>Nick Mayhew</strong>
            <p>MPhil in Management from the JBS with a BSc in Computer Science from Stanford and a SWE internship from Amazon</p>
          </div>

          <div className='team-member'>
            <img src={Boyne} alt="Ollie Boyne" />
            <strong>Ollie Boyne</strong>
            <p>PhD Student in Computer Vision at Cambridge, studying shape reconstruction from multiview images.</p>
          </div>


        </div>
      </section>
      <br />  <br />
      <a href="https://www.flaticon.com/free-icons/film" title="film icons">Film and Camera icons created by juicy_fish - Flaticon</a>
    </div>
  );
};

export default InfoPage;
