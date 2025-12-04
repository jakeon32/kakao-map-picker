let map;
let marker;
let geocoder;
let places;
let kakaoApiKey;

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // API 키 가져오기
        await loadKakaoApiKey();

        // 카카오맵 스크립트 동적 로드
        await loadKakaoMapScript();

        // 지도 초기화
        initMap();

        // 이벤트 리스너 설정
        setupEventListeners();
    } catch (error) {
        console.error('초기화 오류:', error);
        showToast('지도를 로드하는 중 오류가 발생했습니다.', 'error');
    }
});

// API 키 로드
async function loadKakaoApiKey() {
    try {
        const response = await fetch('/api/kakao-key');
        const data = await response.json();

        if (!data.apiKey) {
            throw new Error('API 키를 가져올 수 없습니다.');
        }

        kakaoApiKey = data.apiKey;
        console.log('API 키 로드 성공');
    } catch (error) {
        console.error('API 키 로드 오류:', error);
        throw error;
    }
}

// 카카오맵 스크립트 동적 로드
function loadKakaoMapScript() {
    return new Promise((resolve, reject) => {
        if (window.kakao && window.kakao.maps) {
            resolve();
            return;
        }

        const script = document.createElement('script');
        const scriptUrl = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${kakaoApiKey}&libraries=services&autoload=false`;
        console.log('카카오맵 스크립트 로드 시도:', scriptUrl.replace(kakaoApiKey, 'xxxxx'));

        script.src = scriptUrl;
        script.onload = () => {
            console.log('카카오맵 스크립트 로드 완료');
            window.kakao.maps.load(() => {
                console.log('카카오맵 초기화 완료');
                resolve();
            });
        };
        script.onerror = (error) => {
            console.error('스크립트 로드 실패 상세:', error);
            reject(new Error('카카오맵 스크립트 로드 실패'));
        };
        document.head.appendChild(script);
    });
}

// 지도 초기화
function initMap() {
    const container = document.getElementById('map');
    const options = {
        center: new kakao.maps.LatLng(37.5665, 126.9780), // 서울 시청
        level: 3
    };

    map = new kakao.maps.Map(container, options);
    geocoder = new kakao.maps.services.Geocoder();
    places = new kakao.maps.services.Places();

    // 지도 크기 재조정 (컨테이너 크기 인식)
    setTimeout(() => {
        map.relayout();
    }, 100);

    // 지도 클릭 이벤트
    kakao.maps.event.addListener(map, 'click', function(mouseEvent) {
        const latlng = mouseEvent.latLng;
        updateMarker(latlng);
        getAddressFromCoords(latlng);
    });
}

// 마커 업데이트
function updateMarker(position) {
    if (marker) {
        marker.setMap(null);
    }

    marker = new kakao.maps.Marker({
        position: position,
        map: map
    });

    // 좌표 정보 업데이트
    const lat = position.getLat().toFixed(7);
    const lng = position.getLng().toFixed(7);

    document.getElementById('latText').textContent = lat;
    document.getElementById('lngText').textContent = lng;
    document.getElementById('coordsText').textContent = `${lat}, ${lng}`;
}

// 좌표로 주소 검색
function getAddressFromCoords(coords) {
    geocoder.coord2Address(coords.getLng(), coords.getLat(), (result, status) => {
        if (status === kakao.maps.services.Status.OK) {
            const address = result[0].address.address_name;
            document.getElementById('addressText').textContent = address;
        } else {
            document.getElementById('addressText').textContent = '주소를 찾을 수 없습니다';
        }
    });
}

// 주소 및 장소 검색
function searchAddress() {
    const searchInput = document.getElementById('searchInput');
    const keyword = searchInput.value.trim();

    if (!keyword) {
        showToast('검색어를 입력하세요', 'warning');
        return;
    }

    // 먼저 키워드(장소명) 검색 시도
    places.keywordSearch(keyword, (result, status) => {
        if (status === kakao.maps.services.Status.OK && result.length > 0) {
            // 키워드 검색 성공
            const place = result[0];
            const coords = new kakao.maps.LatLng(place.y, place.x);

            // 지도 중심 이동
            map.setCenter(coords);

            // 마커 표시 및 정보 업데이트
            updateMarker(coords);

            // 좌표로 주소 가져오기
            getAddressFromCoords(coords);

            showToast(`'${place.place_name}' 을(를) 찾았습니다`, 'success');
        } else {
            // 키워드 검색 실패 시 주소 검색 시도
            geocoder.addressSearch(keyword, (result, status) => {
                if (status === kakao.maps.services.Status.OK) {
                    const coords = new kakao.maps.LatLng(result[0].y, result[0].x);

                    // 지도 중심 이동
                    map.setCenter(coords);

                    // 마커 표시 및 정보 업데이트
                    updateMarker(coords);
                    document.getElementById('addressText').textContent = result[0].address_name;

                    showToast('주소를 찾았습니다', 'success');
                } else {
                    showToast('검색 결과를 찾을 수 없습니다. 다시 시도해주세요.', 'error');
                }
            });
        }
    });
}

// 이벤트 리스너 설정
function setupEventListeners() {
    // 검색 버튼
    document.getElementById('searchBtn').addEventListener('click', searchAddress);

    // 엔터키로 검색
    document.getElementById('searchInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchAddress();
        }
    });

    // 복사 버튼들
    document.getElementById('copyAddress').addEventListener('click', () => {
        const text = document.getElementById('addressText').textContent;
        copyToClipboard(text, '주소가 복사되었습니다');
    });

    document.getElementById('copyLat').addEventListener('click', () => {
        const text = document.getElementById('latText').textContent;
        copyToClipboard(text, '위도가 복사되었습니다');
    });

    document.getElementById('copyLng').addEventListener('click', () => {
        const text = document.getElementById('lngText').textContent;
        copyToClipboard(text, '경도가 복사되었습니다');
    });

    document.getElementById('copyCoords').addEventListener('click', () => {
        const text = document.getElementById('coordsText').textContent;
        copyToClipboard(text, '좌표가 복사되었습니다');
    });
}

// 클립보드 복사
async function copyToClipboard(text, message) {
    if (text === '-' || text === '지도를 클릭하세요') {
        showToast('복사할 데이터가 없습니다', 'warning');
        return;
    }

    try {
        await navigator.clipboard.writeText(text);
        showToast(message, 'success');
    } catch (err) {
        console.error('복사 실패:', err);
        showToast('복사에 실패했습니다', 'error');
    }
}

// 토스트 메시지 표시
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type} show`;

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}
