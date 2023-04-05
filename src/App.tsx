import { useEffect, useRef, useState } from 'react';
import 'comment-core-library';
import { Button, Carousel, Tag, message } from 'antd';
import './App.scss';
import axios from 'axios';
import { PlayCircleTwoTone, RocketTwoTone, SettingTwoTone, setTwoToneColor, SoundTwoTone } from '@ant-design/icons';
import { baseUrl } from './config';
import { CommentManager, CommentProvider, BilibiliFormat } from './utils/CommentCoreLibrary';
import SelectModal from './components/SelectModal';
import SettingModal from './components/SettingModal';
message.config({
  maxCount: 1,
});
setTwoToneColor('#ee5a5a');

function App() {
  const timers = useRef<any>({});
  const canvas = useRef<any>({});
  const cm = useRef<any>({});
  const audioRef = useRef<HTMLAudioElement>(null);
  const selectModal = useRef<any>({});

  const [audioTitle, setAudioTitle] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [volume, setVolume] = useState(0);
  const [coverUrls, setCoverUrls] = useState([]);

  useEffect(() => {
    cm.current = new CommentManager(canvas.current);
    cm.current.init();
    cm.current.start();
    cm.current.clear();
  }, []);

  const handlerConfirmDm = async (node: any) => {
    const danmukuUrl = `${baseUrl}/danmuku/data/${encodeURIComponent(node.key)}`;
    localStorage.setItem('danmuku_key', node.key);
    const cp = new CommentProvider()
      // @ts-ignore
      .addStaticSource(CommentProvider.XMLProvider('GET', danmukuUrl), CommentProvider.SOURCE_XML)
      .addParser(new BilibiliFormat.XMLParser(), CommentProvider.SOURCE_XML)
      .addTarget(cm.current);
    cp.start().catch((e: any) => {
      console.log(e);
    });
    selectModal?.current?.setDmKey(node.key);
    // getBroadcastInfo(node.key.split('/')[0]);
    getEpisideInfo(node);
  };

  // 获取封面 对应的json数据
  const getBroadcastInfo = async (name: string) => {
    const { data } = await axios.get(`${baseUrl}/load-images`);
    console.log(data);
  };

  const handlerConfirmBc = async (node: any) => {
    const broadcastUrl = `${baseUrl}/audio/data/${encodeURIComponent(node.key)}`;
    localStorage.setItem('audio_key', node.key);
    setAudioUrl(broadcastUrl);
    // title 设置为缩略展示
    let title = node.key.split('/').filter(Boolean).join(' - ');
    if (title.length > 25) {
      const sliceLength = Math.floor( (title.length - 16) / 2);
      title = title.slice(0, sliceLength) + '...' + title.slice(title.length - sliceLength, title.length) 
    }
    setAudioTitle(title);
    selectModal.current?.setBcKey(node.key);
  };

  const getEpisideInfo = async (node: any) => {
    const [name, soundName] = node.key.split('/').filter(Boolean);
    const { data } = await axios.get(`${baseUrl}/cover/list?name=${name}&soundName=${soundName.replace('.xml', '')}`);
    setCoverUrls((data.data || []).map((url: string) => `${baseUrl}/${url}`));
    // setCoverUrl(`${baseUrl}/image?name=${name}&soundName=${soundName.replace('.xml', '')}`);
  };

  // 开始播放弹幕
  const startDisplayingDanmuku = async () => {
    const audioPlayer = audioRef.current;
    if (audioPlayer === null) {
      return;
    }
    if (cm.current) {
      clearTimeout(timers.current.danmuku);
      clearTimeout(timers.current.progress);
      timers.current.danmuku = setInterval(function () {
        cm.current.time(Math.round(audioPlayer.currentTime * 1000));
      }, 16.67);
      // 没隔一秒设置一次进度
      timers.current.progress = setInterval(function () {
        localStorage.setItem('audio_progress', audioPlayer.currentTime.toString());
      }, 1000);
    }
    cm.current.start();
  };

  // 停止播放弹幕
  const stopDisplayingDanmuku = () => {
    if (cm.current) {
      cm.current.stop();
      clearTimeout(timers.current.danmuku);
      clearTimeout(timers.current.progress);
    }
  };

  const handlerPlay = () => {
    const audioPlayer = audioRef.current;
    if (audioPlayer === null) {
      return;
    }
    if (audioPlayer.paused) {
      audioPlayer.play();
      startDisplayingDanmuku();
    } else {
      audioPlayer.pause();
      stopDisplayingDanmuku();
    }
  };

  // 切换剧集后重新开始播放
  const handlerStart = () => {
    stopDisplayingDanmuku();
    const audioPlayer = audioRef.current;
    if (audioPlayer === null) {
      return;
    }
    audioPlayer.currentTime = 0;
    handlerPlay();
  };


  const handlerAudioPlay = (e: any) => {
    startDisplayingDanmuku();
  };

  const handlerAudioPause = (e: any) => {
    stopDisplayingDanmuku();
  };
  // 切换音量
  const handlerVolumeChange = (e: any) => {
    localStorage.setItem('audio_volume', e.target.volume);
    setVolume(e.target.volume);
  };

  const handlerWheel = (e: any) => {
    const audioPlayer = audioRef.current;
    if (audioPlayer === null) {
      return;
    }
    if (e.deltaY > 0) {
      const v = audioPlayer.volume - 0.05;
      if (v >= 0) {
        audioPlayer.volume = v;
      } else {
        audioPlayer.volume = 0;
      }
    } else if (e.deltaY < 0) {
      const v = audioPlayer.volume + 0.05;
      if (v <= 1) {
        audioPlayer.volume = v;
      } else {
        audioPlayer.volume = 1;
      }
    }
  };

  const initProgress = () => {
    const danmukuKey = localStorage.getItem('danmuku_key');
    const broadcastKey = localStorage.getItem('audio_key');
    const audioVolume = localStorage.getItem('audio_volume');
    const audioProgree = localStorage.getItem('audio_progress');
    // 加载之前的播放进度
    if (broadcastKey) {
      handlerConfirmBc({ key: broadcastKey });
      if (audioProgree && audioRef.current) {
        audioRef.current.currentTime = +audioProgree || 0;
      }
    }
    if (danmukuKey) {
      handlerConfirmDm({ key: danmukuKey });
    }
    if (audioVolume && audioRef.current) {
      audioRef.current.volume = +audioVolume || 0;
    }

    if (audioRef.current) {
      setVolume(audioRef.current.volume);
    }
  };

  const wakeLock = useRef<any>(null);

  const initWakeLoack = async () => {
    if ('wakeLock' in navigator) {
      // 可以保持屏幕唤醒, 但只有在https环境下才能生效
      // @ts-ignore
      wakeLock.current = await navigator.wakeLock?.request('screen');
    }
  };

  useEffect(() => {
    initProgress();
    initWakeLoack();
    window.addEventListener('resize', () => {
      cm.current?.setBounds();
    });

    return () => {
      if (wakeLock?.current) {
        wakeLock.current.release().then(() => {
          wakeLock.current = null;
        });
      }
    };
  }, []);

  return (
    <div className='app'>
      <div className='container' onWheel={handlerWheel}>
        <div className='container__cover'>
          <Carousel autoplay dotPosition='right' dots pauseOnDotsHover autoplaySpeed={30000} easing='easeInOut'>
            {coverUrls?.length &&
              coverUrls.map((url) => <img key={url} className='container__cover--image' src={url} alt='' />)}
          </Carousel>
        </div>
        <div className='container__canvas' ref={canvas}></div>
      </div>
      <div className='footer'>
        <div>
          <Button
            shape='circle'
            ghost
            danger
            onClick={() => {
              selectModal.current.show();
            }}
            title='弹幕'
          >
            <RocketTwoTone style={{ fontSize: 16 }} />
          </Button>
          {/* <Button
            ghost
            shape='circle'
            danger
            title='音频'
            onClick={() => {
              audioTree.current.show();
            }}
          >
            <CustomerServiceTwoTone style={{ fontSize: 16 }} />
          </Button> */}
          <Button title='从头开始播放' ghost danger shape='circle' onClick={handlerStart}>
            <PlayCircleTwoTone style={{ fontSize: 16 }} />
          </Button>
        </div>

        {audioTitle && (
          <div className='audio-title'>
            <Tag color='red'>{audioTitle}</Tag>
          </div>
        )}

        <div>
          <Tag icon={<SoundTwoTone />} color='red'>
            {(volume * 100).toFixed(0)}
          </Tag>
          <SettingModal/>
        </div>

        <audio
          onVolumeChange={handlerVolumeChange}
          onPlay={handlerAudioPlay}
          onPause={handlerAudioPause}
          ref={audioRef}
          src={audioUrl}
          controls
          preload='auto'
        ></audio>
      </div>

      <SelectModal ref={selectModal} onConfirmDm={handlerConfirmDm} onConfirmBc={handlerConfirmBc} />
    </div>
  );
}

export default App;
