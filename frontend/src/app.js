import { apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId } from '../config.js';

const search = document.getElementById('search');
const matchList = document.getElementById('match-list');

let timecodeData = []

const searchStates = async searchText => {
  const states = timecodeData

  // Mapping to one string, for easier searching
  const formatChapterData = arr => {
    return arr.reduce((prev, curr) => {
      const data = curr.chapters.map(el => `${el} | ${curr.videoId} | ${curr.title} | ${curr.thumbnails}`)
      
      return [...prev, ...data]
    }, [])
  }

  const formattedData = formatChapterData(states)

  const searchOnChaptersOnly = (state) => state.split(' | ')[0]

  let matches = formattedData.filter(state => {
    const regex = new RegExp(`${searchText.toUpperCase()}`, 'gi');

    return searchOnChaptersOnly(state.toUpperCase()).match(regex);
  });

  if (searchText.length === 0) {
    matches = []
    matchList.innerHTML = ''
  }

  outputHtml(matches, searchText)
}

const getChapterSeconds = chapter => {
  let time = chapter.split(' ')[0].split(':')
  let seconds

  if (time.length === 3) {
    seconds = (+time[0]) * 60 * 60 + (+time[1]) * 60 + (+time[2]); 
  } else if (time.length === 2) {
    seconds = (+time[0]) * 60 + (+time[1]); 
  }

  return seconds
}

const outputHtml = (matches, searchText) => {
  if (matches.length > 0) {
    const getMatchData = str => {
      const splitted = str.split(' | ');

      return ({
        videoId: splitted[1],
        title: splitted[2],
        chapters: splitted[0],
      })
    }

    const html = matches.map(match =>{
      const { videoId, title, chapters } = getMatchData(match);
      const seconds = getChapterSeconds(chapters)

      const regexMatching = (text) => {
        const regex = new RegExp(`^${searchText.toUpperCase()}`, 'gi');

        return text.toUpperCase().match(regex);
      }
      
      const highlightSearchText = ch => ch.split(' ')
        .map(el => {
          return regexMatching(el.toUpperCase())
            ? `<span style="color: white">${el}</span>`
            : el
        }
        )
        .join(' ')

      return (
        `
          <div class="card card-body mb-1">
            <h4>${title}</h4>
            <a target="_blank" href="https://youtu.be/${videoId}?t=${seconds}">${highlightSearchText(chapters)}</a>
          </div>
        `
      )
    }).join('')

    matchList.innerHTML = html
  }
}

const fetchJsonFile = () => {
  const fileName = 'poplava.json'
  const storageRef = firebase.storage().ref()
  const fileRef = storageRef.child(fileName)

  return fileRef
    .getDownloadURL()
    .then(url => fetch(url, {
        headers: {
          Accept: 'application/json',
        },
    }).then(response => response.json()))
    .catch(error => {
      console.error('Error fetching JSON:', error)
    })
}


async function init() {
  const firebaseConfig = {
    apiKey,
    authDomain,
    projectId,
    storageBucket,
    messagingSenderId,
    appId,
  };

  firebase.initializeApp(firebaseConfig);

  try {
    const jsonData = await fetchJsonFile();
    timecodeData = jsonData
    search.addEventListener('input', () => searchStates(search.value));
  } catch (error) {
    console.error('Error fetching JSON:', error);
  }
}

init();