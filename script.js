document.addEventListener('DOMContentLoaded', async function () {
    const regionSelect = document.getElementById('regionSelect');
    const slider = document.getElementById('timeSlider');
    const image = document.getElementById('sliderImage');
    const speedDisplay = document.getElementById('speedDisplayContainer');
    const fasterButton = document.getElementById('fasterButton');
    const slowerButton = document.getElementById('slowerButton');
    const playPauseButton = document.getElementById('playPauseButton');
    const saveButton = document.getElementById('saveButton');
    const lastRefresh = document.getElementById('lastRefresh');

    const regionURLs = {
        nationwide: "https://radar.kma.go.kr/cgi-bin/center/nph-rdr_cmp_img?cmp=HSP&color=C2&qcd=HSO&obs=ECHO&map=HB&size=1000&xp=720&yp=614&ht=700&zoom=2&lonlat=1&gis=1&legend=1&aws=1&gov=KMA&color=C4&wv=1&ht=800&topo=1&gc=T&gc_itv=60&tm=",
        seoul: "https://radar.kma.go.kr/cgi-bin/center/nph-rdr_cmp_img?cmp=HSP&color=C2&qcd=HSO&obs=ECHO&map=HB&size=1000&xp=630&yp=790&ht=700&zoom=4.9&lonlat=1&gis=1&legend=1&aws=1&gov=KMA&color=C4&wv=1&ht=2000&topo=1&gc_itv=60&tm=",
        chungcheong: "https://radar.kma.go.kr/cgi-bin/center/nph-rdr_cmp_img?cmp=HSP&color=C2&qcd=HSO&obs=ECHO&map=HB&size=1000&xp=675&yp=680&ht=700&zoom=4.9&lonlat=1&gis=1&legend=1&aws=1&gov=KMA&color=C4&wv=1&ht=2000&topo=1&gc_itv=60&tm=",
        honam: "https://radar.kma.go.kr/cgi-bin/center/nph-rdr_cmp_img?cmp=HSP&color=C2&qcd=HSO&obs=ECHO&map=HB&size=1000&xp=630&yp=528&ht=700&zoom=4.9&lonlat=1&gis=1&legend=1&aws=1&gov=KMA&color=C4&wv=1&ht=2000&topo=1&gc_itv=60&tm=",
        gyeongnam: "https://radar.kma.go.kr/cgi-bin/center/nph-rdr_cmp_img?cmp=HSP&color=C2&qcd=HSO&obs=ECHO&map=HB&size=1000&xp=790&yp=550&ht=700&zoom=4.9&lonlat=1&gis=1&legend=1&aws=1&gov=KMA&color=C4&wv=1&ht=2000&topo=1&gc_itv=60&tm=",
        gyeongbuk: "https://radar.kma.go.kr/cgi-bin/center/nph-rdr_cmp_img?cmp=HSP&color=C2&qcd=HSO&obs=ECHO&map=HB&size=1000&xp=800&yp=660&ht=700&zoom=4.9&lonlat=1&gis=1&legend=1&aws=1&gov=KMA&color=C4&wv=1&ht=2000&topo=1&gc_itv=60&tm=",
        gangwon: "https://radar.kma.go.kr/cgi-bin/center/nph-rdr_cmp_img?cmp=HSP&color=C2&qcd=HSO&obs=ECHO&map=HB&size=1000&xp=760&yp=820&ht=700&zoom=4.9&lonlat=1&gis=1&legend=1&aws=1&gov=KMA&color=C4&wv=1&ht=2000&topo=1&gc_itv=60&tm=",
        jeju: "https://radar.kma.go.kr/cgi-bin/center/nph-rdr_cmp_img?cmp=HSP&color=C2&qcd=HSO&obs=ECHO&map=HB&size=1000&xp=610&yp=340&ht=700&zoom=4.9&lonlat=1&gis=1&legend=1&aws=1&gov=KMA&color=C4&wv=1&ht=2000&topo=1&gc_itv=60&tm=",
        dongasia: "https://radar.kma.go.kr/cgi-bin/center/nph-rdr_cmp_img?cmp=HSP&color=C2&qcd=HSO&obs=ECHO&map=HB&size=1000&xp=600&yp=150&ht=700&zoom=0.5&lonlat=1&gis=1&legend=1&aws=1&gov=KMA&color=C4&wv=0&ht=2000&topo=0&gc=T&gc_itv=60&tm="
    };

    let baseURL = regionURLs['nationwide'];
    let intervalId;
    let isPlaying = true;
    let preloadedImages = [];
    let speed = parseInt(localStorage.getItem('speed')) || 500; // Default speed in milliseconds or saved value

    // Load selected region from localStorage
    const savedRegion = localStorage.getItem('selectedRegion');
    if (savedRegion) {
        baseURL = regionURLs[savedRegion];
        regionSelect.value = savedRegion;
    }

    async function getInternetTime() {
        const response = await fetch('https://worldtimeapi.org/api/timezone/Asia/Seoul');
        const data = await response.json();
        return new Date(data.datetime);
    }

    function formatDate(date, type = "url") {
        const y = date.getFullYear();
        const m = ('0' + (date.getMonth() + 1)).slice(-2);
        const d = ('0' + date.getDate()).slice(-2);
        const h = ('0' + date.getHours()).slice(-2);
        const min = ('0' + date.getMinutes()).slice(-2);
        const s = ('0' + date.getSeconds()).slice(-2);
        if (type === "url") {
            return `${y}${m}${d}${h}${min}`;
        } else {
            return `${y}.${m}.${d} ${h}:${min}:${s}`;
        }
    }

    async function generateImageURLs(region) {
        const urls = [];
        const nowKST = await getInternetTime();

        if (region === 'dongasia') {
            nowKST.setMinutes(Math.floor(nowKST.getMinutes() / 20) * 20);
            nowKST.setSeconds(0);
            nowKST.setMilliseconds(0);
            for (let i = 0; i < 36; i++) { // 12 hours = 36 images (20 minutes interval)
                const date = new Date(nowKST.getTime() - i * 20 * 60000);
                const formattedDate = formatDate(date);
                urls.push(baseURL + formattedDate);
            }
        } else {
            nowKST.setMinutes(Math.floor(nowKST.getMinutes() / 5) * 5);
            nowKST.setSeconds(0);
            nowKST.setMilliseconds(0);
            for (let i = 0; i < 24; i++) { // 2 hours = 24 images (5 minutes interval)
                const date = new Date(nowKST.getTime() - i * 5 * 60000);
                const formattedDate = formatDate(date);
                urls.push(baseURL + formattedDate);
            }
        }
        return urls.reverse();
    }

    async function updateImages() {
        const region = regionSelect.value;
        const images = await generateImageURLs(region);
        preloadedImages = images.map(url => {
            const img = new Image();
            img.src = url;
            return img;
        });

        // Update the image source based on slider value
        slider.max = preloadedImages.length;
        slider.addEventListener('input', function () {
            const index = slider.value - 1;
            image.src = preloadedImages[index].src;
        });

        // Initialize the first image
        image.src = preloadedImages[0].src;

        // Set up the automatic slide show
        startAutoPlay();
    }

    function startAutoPlay() {
        clearInterval(intervalId);
        intervalId = setInterval(() => {
            slider.value = (parseInt(slider.value) % preloadedImages.length) + 1;
            const index = slider.value - 1;
            image.src = preloadedImages[index].src;
        }, speed);
    }

    playPauseButton.addEventListener('click', function () {
        if (isPlaying) {
            clearInterval(intervalId);
            playPauseButton.textContent = '재생';
        } else {
            startAutoPlay();
            playPauseButton.textContent = '정지';
        }
        isPlaying = !isPlaying;
    });

    fasterButton.addEventListener('click', function () {
        if (speed > 100) {
            speed -= 100;
            speedDisplay.textContent = `${(speed / 1000).toFixed(1)} s/frame`;
            localStorage.setItem('speed', speed); // Save speed to localStorage
            if (isPlaying) {
                clearInterval(intervalId);
                startAutoPlay();
            }
        }
    });

    slowerButton.addEventListener('click', function () {
        if (speed < 2000) {
            speed += 100;
            speedDisplay.textContent = `${(speed / 1000).toFixed(1)} s/frame`;
            localStorage.setItem('speed', speed); // Save speed to localStorage
            if (isPlaying) {
                clearInterval(intervalId);
                startAutoPlay();
            }
        }
    });

    regionSelect.addEventListener('change', function () {
        baseURL = regionURLs[regionSelect.value];
        localStorage.setItem('selectedRegion', regionSelect.value); // Save selected region to localStorage
        updateImages();
    });

    saveButton.addEventListener('click', async function () {
        // Load required libraries
        await loadScript('https://cdn.jsdelivr.net/npm/html2canvas@1.0.0-rc.7/dist/html2canvas.min.js');
        await loadScript('https://cdn.jsdelivr.net/npm/ffmpeg.js@4.2.9003/ffmpeg.min.js');

        const frames = [];
        for (let i = 0; i < preloadedImages.length; i++) {
            slider.value = i + 1;
            const canvas = await html2canvas(image);
            frames.push(canvas.toDataURL('image/jpeg'));
        }

        const ffmpeg = createFFmpeg({ log: true });
        await ffmpeg.load();

        for (let i = 0; i < frames.length; i++) {
            ffmpeg.FS('writeFile', `frame${i}.jpg`, await fetchFile(frames[i]));
        }

        await ffmpeg.run('-r', '1', '-i', 'frame%d.jpg', '-vcodec', 'libx264', 'output.mp4');

        const data = ffmpeg.FS('readFile', 'output.mp4');
        const videoBlob = new Blob([data.buffer], { type: 'video/mp4' });

        const a = document.createElement('a');
        a.href = URL.createObjectURL(videoBlob);
        a.download = 'video.mp4';
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    });

    // Function to load external scripts
    function loadScript(url) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = url;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    // Initial load
    await updateImages();

    // Display the correct speed on page load
    speedDisplay.textContent = `${(speed / 1000).toFixed(1)} s/frame`;

    // Update last refresh time
    lastRefresh.textContent += formatDate(new Date(), "display");

    // Auto refresh every 5 minutes (300,000 milliseconds)
    setInterval(() => {
        location.reload();
    }, 300000);
});
