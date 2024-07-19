// 객체 생성
let StateEnum = {
  DISABLED: 'disabled',
  DISPLAY: 'display',
  SYSTEM: 'system'
};

// 'state'에 저장된 값('disabled', 'display', 'system' 중 하나)을 불러와 callback 함수에 변수로 입력
// 다른 값이 들어있으면 'disabled'로 입력
function loadSavedState(callback) {
  chrome.storage.local.get('state', function (items) {
    let savedState = items['state'];
    for (let key in StateEnum) {
      if (savedState == StateEnum[key]) {
        callback(savedState);
        return;
      }
    }
    callback(StateEnum.DISABLED);
  });
}

// newState값을 스토리지에 저장, 액션 아이콘 변경, 타이틀 변경
function setState(newState) {
  let imagePrefix = 'night';
  let title = '';

  switch (newState) {
    case StateEnum.DISABLED:
      chrome.power.releaseKeepAwake();
      imagePrefix = 'night';
      title = chrome.i18n.getMessage('disabledTitle');
      break;
    case StateEnum.DISPLAY:
      chrome.power.requestKeepAwake('display');
      imagePrefix = 'day';
      title = chrome.i18n.getMessage('displayTitle');
      break;
    case StateEnum.SYSTEM:
      chrome.power.requestKeepAwake('system');
      imagePrefix = 'sunset';
      title = chrome.i18n.getMessage('systemTitle');
      break;
    default:
      throw 'Invalid state "' + newState + '"';
  }

  let items = {};
  items['state'] = newState;
  chrome.storage.local.set(items);

  chrome.action.setIcon({
    path: {
      19: 'images/' + imagePrefix + '-19.png',
      38: 'images/' + imagePrefix + '-38.png'
    }
  });
  chrome.action.setTitle({ title: title });
}

// 아이콘 클릭 시 다음 상태로 변경
chrome.action.onClicked.addListener(function () {
  loadSavedState(function (state) {
    switch (state) {
      case StateEnum.DISABLED:
        setState(StateEnum.DISPLAY);
        break;
      case StateEnum.DISPLAY:
        setState(StateEnum.SYSTEM);
        break;
      case StateEnum.SYSTEM:
        setState(StateEnum.DISABLED);
        break;
      default:
        throw 'Invalid state "' + state + '"';
    }
  });
});

// 시작할 때 상태를 불러와서 저장하고 적용
chrome.runtime.onStartup.addListener(function () {
  loadSavedState(function (state) {
    setState(state);
  });
});
