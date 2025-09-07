class VideoTransition {
  constructor(dom, imgSrcArr) {
    this.dom = dom;
    this.imgSrcArr = imgSrcArr;
    this.preloadedImages = []; // 存储预加载的图片对象
    this.scrollInVideoDomFlag = true;
    this.index = 0;
    this.init();
  }
  init() {
    this.bindEvent();
  }
  bindEvent() {}
  setDomImgIndex(index) {
    this.index = index;
  }
  setPreloadedImages(preloadedImages) {
    this.preloadedImages = preloadedImages;
  }
  setDomBg() {
    // 确保索引在有效范围内
    const validIndex = Math.max(
      0,
      Math.min(this.index, this.imgSrcArr.length - 1)
    );

    // 优先使用预加载的图片对象
    if (
      this.preloadedImages[validIndex] &&
      this.preloadedImages[validIndex].complete
    ) {
      this.dom.style.backgroundImage = `url(${this.preloadedImages[validIndex].src})`;
    } else {
      // 如果预加载失败，则使用原始路径
      this.dom.style.backgroundImage = `url(${this.imgSrcArr[validIndex]})`;
    }
  }
  getScrollChangeDomFlag() {
    return this.scrollInVideoDomFlag;
  }
  setUnRunState() {
    // this.dom.style.position = "relative";
  }
  showLoad() {
    const loadingText = document.createElement("div");
    loadingText.className = "loadingText";
    loadingText.style.cssText = ``;
    loadingText.textContent = "正在加载图片...";
    this.dom.appendChild(loadingText);
  }
  hiddenLoad() {
    const loadingText = document.querySelector(".loadingText");
    loadingText && this.dom.removeChild(loadingText);
  }
}
function initImgs() {
  const imgSrcArr = [];
  for (let i = 1; i <= 120; i++) {
    imgSrcArr.push(`./imgs/${i}.png`); // 修改为正确的相对路径
  }
  return imgSrcArr;
}

// 图片预加载函数
function preloadImages(imgSrcArr) {
  return new Promise((resolve, reject) => {
    let loadedCount = 0;
    const totalImages = imgSrcArr.length;
    const loadedImages = [];
    const loadErrors = [];

    console.log(`开始预加载 ${totalImages} 张图片...`);

    imgSrcArr.forEach((src, index) => {
      const img = new Image();

      img.onload = () => {
        loadedCount++;
        loadedImages[index] = img;
        console.log(
          `已加载: ${loadedCount}/${totalImages} (${Math.round(
            (loadedCount / totalImages) * 100
          )}%) - ${src}`
        );

        if (loadedCount === totalImages) {
          console.log("所有图片预加载完成!");
          if (loadErrors.length > 0) {
            console.warn("部分图片加载失败:", loadErrors);
          }
          resolve(loadedImages);
        }
      };

      img.onerror = () => {
        loadedCount++; // 即使失败也计入总数
        loadErrors.push(src);
        console.error(`图片加载失败: ${src}`);

        if (loadedCount === totalImages) {
          console.log("所有图片处理完成!");
          if (loadErrors.length > 0) {
            console.warn("部分图片加载失败:", loadErrors);
          }
          resolve(loadedImages);
        }
      };

      // 设置超时
      setTimeout(() => {
        if (!img.complete) {
          console.warn(`图片加载超时: ${src}`);
        }
      }, 10000); // 10秒超时

      img.src = src;
    });
  });
}
window.addEventListener("DOMContentLoaded", async function () {
  const imgSrcArr = initImgs();

  // 显示加载状态
  const videoWrapper = document.querySelector("#videoTransitionWrapper");

  try {
    // 初始化视频过渡组件
    const videoTranstion = new VideoTransition(
      document.querySelector("#videoTransitionWrapper"),
      imgSrcArr
    );

    videoTranstion.showLoad();
    // 预加载所有图片
    const preloadedImages = await preloadImages(imgSrcArr);
    videoTranstion.setPreloadedImages(preloadedImages); // 设置预加载的图片
    videoTranstion.hiddenLoad();

    // 使用 scroll 事件而不是 wheel 事件，更稳定
    window.addEventListener("scroll", function (event) {
      let scroll = window.scrollY;
      const imageIndex = Math.floor(scroll / 100);

      // 确保索引在有效范围内
      const validIndex = Math.max(
        0,
        Math.min(imageIndex, imgSrcArr.length - 1)
      );

      videoTranstion.setDomImgIndex(validIndex);
      videoTranstion.setDomBg();
    });
  } catch (error) {
    console.error("图片预加载失败:", error);
  }
});
