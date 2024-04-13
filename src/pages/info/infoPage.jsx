import React, { useEffect } from 'react';
import './infoPage.css'; // Importing your CSS
import { Lynch, Parish, Mayhew, Boyne } from '../../assets/images'
import { useNavigate } from "react-router-dom";
import IconButton from '@material-ui/core/IconButton';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';

const InfoPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://app.termly.io/embed-policy.min.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  return (

    <div className="infoPage">

      <div className="streamerplayer-backButton">
        <IconButton edge="start" color="inherit" aria-label="back" onClick={async () => {
          navigate('/');
        }}>
          <ArrowBackIcon />
        </IconButton>
      </div>
      
      <section id="intro">
        <p>
         More and more people want to watch local sports events online. However, operating a livestream is prohibitively expensive and difficult to set-up for most event organizers. 
        </p>
      </section>

      <h1>What is <span className="CSFont">
        <span className="CSBlack">Crowd</span>
        <span className="CSRed">Stream</span>
      </span>?</h1>
      <section id="what-is">
        <p>
          <b>
        <span className="CSBlack">Crowd</span>
        <span className="CSRed">Stream</span> is the easiest way for event organizers to provide a livestream of their event.  </b> 
        </p>
        <p>

        On-site spectators and event volunteers can broadcast their perspective of the event by using <span className="CSBlack">Crowd</span><span className="CSRed">Stream</span> on their phone.
        </p>
        <p>
         Then, online viewers have a selection of perspectives to view on the <span className="CSBlack">Crowd</span>
        <span className="CSRed">Stream</span> map. Viewers can create their own experience by switching between available broadcasts of the event.  
          </p>
          <p>
          Anything broadcast to <span className="CSBlack">Crowd</span><span className="CSRed">Stream</span> is also available to save and rewatch in the future.   
        </p>
      </section>

      <h1>How do I get started?</h1>
      <section id="get-started">
        <p><b>To watch a stream:</b> Simply click on a pin on the map!</p>
        <p><b>To stream:</b> Click on the "Start Broadcasting" icon in the top right corner of the screen. Depending on the event, you may need to enter a password or log-in before sharing your perspective</p>
      </section>

      {<h1>About Us</h1>}
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
        < br />
     <p>
      Our team got together after rowing in (and winning!) the 2023 Boat Race for Cambridge. 
      </p>
      <p>
      We were frustrated with the fact that the reserve Goldie-Isis race was completely unavailable online, despite being filmed by hundreds of spectators using their phones down the course. 
      </p>
      <p>
      We'd also all experienced the frustration of trying to view live events online like British University Championships, Fours Head, or Metropolitan Regatta.
      </p>
      </section>


      <h1>Questions?</h1>
      <section id="questions">
        <p>
          If you have any questions or feedback, please email us at <a href="mailto: lyncht248@gmail.com">lyncht248@gmail.com</a> or call at +44 7576 106282.
        </p>
      </section>
      <br /> <br />


    </div>

  );
};

export default InfoPage;
