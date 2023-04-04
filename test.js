// 定义一个函数，用于将中文数字转换为阿拉伯数字
function chineseToArabic(chnStr) {
  let rtn = 0;
  let section = 0;
  let number = 0;
  let secUnit = false;
  let str = chnStr.split('');
  let chnNameValue = {
    十: { value: 10, secUnit: false },
    百: { value: 100, secUnit: false },
    千: { value: 1000, secUnit: false },
    万: { value: 10000, secUnit: true },
    亿: { value: 100000000, secUnit: true },
  };
  //增加‘两’的对象，解决“两百零一”等数字的转换问题
  let chnNumChar = {
    零: 0,
    一: 1,
    二: 2,
    两: 2,
    三: 3,
    四: 4,
    五: 5,
    六: 6,
    七: 7,
    八: 8,
    九: 9,
  };

  //因为要下载小说，所以要排除那些非正文部分章节；同时将“第十章”“第十一章”等原代码出错章节筛选出来
  if (typeof chnNumChar[str[0]] !== 'undefined' || str[0] == '十') {
    //将“第十章”“第十一章”等原代码出错章节进行单独处理
    if (str[0] == '十') {
      //因为只需要处理“十”至“十九”十个数，所以问题就很容易解决，对汉字中索引1的位置进行判断，当为空时，即为0+10=10，非空则从chnNumChar对象中取值加上10，即可得出结果。
      rtn = (chnNumChar[str[1]] || 0) + 10;
    } else {
      for (let i = 0; i < str.length; i++) {
        let num = chnNumChar[str[i]];
        if (typeof num !== 'undefined') {
          number = num;
          if (i === str.length - 1) {
            section += number;
          }
        } else {
          let unit = chnNameValue[str[i]].value;
          secUnit = chnNameValue[str[i]].secUnit;
          if (secUnit) {
            section = (section + number) * unit;
            rtn += section;
            section = 0;
          } else {
            section += number * unit;
          }
          number = 0;
        }
      }
    }
    //此处是将非正文章节的内容的序号设置为0，统一在爬虫下载完成的小说文件的起端放置作者的“感言、请假、设定等”文章
  } else {
    rtn = 0;
    section = 0;
  }

  return rtn + section;
}
// 定义一个排序函数，用于按中文拼音顺序排序
// 定义一个排序函数，用于按中文拼音顺序排序
function sortChineseStrings(strings) {
  // 将中文数字转换为阿拉伯数字，并在字符串前面添加数字作为排序依据
  function addNumber(s) {
    const pattern = /[一二三四五六七八九十百千万]+/;
    const match = s.match(pattern);
    if (match) {
      const number = chineseToArabic(match[0]);
      return `${number.toString().padStart(5, '0')}${s}`;
    } else {
      return `00000${s}`;
    }
  }

  // 对字符串数组进行排序
  return strings.sort((a, b) => {
    const aParts = a.split(' ');
    const bParts = b.split(' ');
    const aName = aParts.slice(0, -1).join(' ');
    const bName = bParts.slice(0, -1).join(' ');
    const aSeason = aParts[aParts.length - 1] || '第零季';
    const bSeason = bParts[bParts.length - 1] || '第零季';
    if (aName === bName) {
      return addNumber(aSeason).localeCompare(addNumber(bSeason), 'zh-Hans-CN');
    } else {
      return addNumber(aName).localeCompare(addNumber(bName), 'zh-Hans-CN');
    }
  });
}


// 测试代码
const strings = ['彼得潘 第二季', '彼得潘 第一季', '天潢贵胄 第一季', '我氪了 第五季', '天潢贵胄 第三季'];
const sortedStrings = sortChineseStrings(strings);
console.log(sortedStrings);