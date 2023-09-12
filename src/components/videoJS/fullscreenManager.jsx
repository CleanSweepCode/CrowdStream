
export class FullscreenManager {
    constructor() {
        this.status = checkIfFullscreen();
    }

    goFullScreen(elem) {
        goFullScreen(elem);
        this.status = true;
    }

    endFullscreen() {
        endFullscreen();
        this.status = false;
    }

    toggleFullscreen(elem) {
        if (this.status) {
            this.endFullscreen();
        } else {
            this.goFullScreen(elem);
        }
    }

    checkIfFullscreen() {
        return checkIfFullscreen();
    }

}


const goFullScreen = (elem) => {
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

const endFullscreen = () => {
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

const checkIfFullscreen = () => {
    return document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement || document.msFullscreenElement;
}