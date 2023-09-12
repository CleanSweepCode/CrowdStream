
const isMobile = () => /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
// const isMobile = () => true;

export class FullscreenManager {
    constructor() {
        this.status = checkIfFullscreen();
    }

    goFullScreen(elem) {
        if (isMobile()) {goMobileFullscreen(elem);}
        else {goDesktopFullscreen(elem);}

        this.status = true;
    }


    endFullscreen() {
        if (isMobile()) {endMobileFullscreen(elem);}
        else {endDesktopFullscreen();}

        this.status = false;
    }

    toggleFullscreen(elem) {
        this.updateStatus();
        if (this.status) {
            this.endFullscreen();
        } else {
            this.goFullScreen(elem);
        }
    }

    updateStatus() {
        this.status = checkIfFullscreen();
    }

}


const goDesktopFullscreen = (elem) => {
      if (elem.requestFullscreen) {
        elem.requestFullscreen();
      } else if (elem.mozRequestFullScreen) { // Firefox
        elem.mozRequestFullScreen();
      } else if (elem.webkitRequestFullscreen) { // Chrome, Safari and Opera
        elem.webkitRequestFullscreen();
      } else if (elem.msRequestFullscreen) { // IE/Edge
        elem.msRequestFullscreen();
      }
  }

const endDesktopFullscreen = () => {
  if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.mozCancelFullScreen) { // Firefox
      document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) { // Chrome, Safari and Opera
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) { // IE/Edge
      document.msExitFullscreen();
    }
  }

const goMobileFullscreen = (elem) => {
    // Save original styles to be able to revert back later
    elem.setAttribute('data-original-style', elem.getAttribute('style') || '');
  
    elem.style.position = 'fixed';
    elem.style.top = '50%';
    elem.style.left = '50%';
    elem.style.transform = 'translate(-50%, -50%)';
    elem.style.width = '100%';
    elem.style.height = '100%';
    elem.style.zIndex = '9999';
};



const endMobileFullscreen = (elem) => {
  // Revert back to original styles
  const originalStyles = elem.getAttribute('data-original-style');
  console.log(originalStyles)
  if (originalStyles !== null) {
    elem.setAttribute('style', originalStyles);
  } else {
    elem.removeAttribute('style');
  }
};

const checkIfFullscreen = () => {
    return document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement || document.msFullscreenElement;
}