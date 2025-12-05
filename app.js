// 전역 변수
let kakaoMap, googleMap;
let kakaoMarker, googleMarker;
let geocoder, places;
let kakaoApiKey, googleApiKey;
let currentMapType = null; // 현재 활성화된 지도
let currentPosition = null; // 현재 선택된 좌표
let availableMaps = { kakao: false, google: false }; // 사용 가능한 지도 추적

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', async () => {
    // 카카오맵 초기화 시도
    try {
        await loadKakaoApiKey();
        await loadKakaoMapScript();
        initKakaoMap();
        availableMaps.kakao = true;
        console.log('카카오맵 초기화 성공');
    } catch (error) {
        console.error('카카오맵 초기화 실패:', error);
        disableMapTab('kakao');
    }

    // 구글맵 초기화 시도
    try {
        await loadGoogleApiKey();
        await loadGoogleMapScript();
        initGoogleMap();
        availableMaps.google = true;
        console.log('구글맵 초기화 성공');
    } catch (error) {
        console.error('구글맵 초기화 실패:', error);
        disableMapTab('google');
    }

    // 기본 지도 설정
    if (availableMaps.kakao) {
        currentMapType = 'kakao';
    } else if (availableMaps.google) {
        currentMapType = 'google';
        switchMap('google');
    } else {
        showToast('사용 가능한 지도가 없습니다. API 키를 확인해주세요.', 'error');
        return;
    }

    // 이벤트 리스너 설정
    setupEventListeners();
});

// 카카오 API 키 로드
async function loadKakaoApiKey() {
    try {
        const response = await fetch('/api/kakao-key');
        const data = await response.json();

        if (!data.apiKey) {
            throw new Error('Kakao API 키를 가져올 수 없습니다.');
        }

        kakaoApiKey = data.apiKey;
        console.log('Kakao API 키 로드 성공');
    } catch (error) {
        console.error('Kakao API 키 로드 오류:', error);
        throw error;
    }
}

// 구글 API 키 로드
async function loadGoogleApiKey() {
    try {
        const response = await fetch('/api/google-key');
        const data = await response.json();

        if (!data.apiKey) {
            throw new Error('Google API 키를 가져올 수 없습니다.');
        }

        googleApiKey = data.apiKey;
        console.log('Google API 키 로드 성공');
    } catch (error) {
        console.error('Google API 키 로드 오류:', error);
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

        script.src = scriptUrl;
        script.onload = () => {
            window.kakao.maps.load(() => {
                console.log('카카오맵 초기화 완료');
                resolve();
            });
        };
        script.onerror = (error) => {
            console.error('카카오맵 스크립트 로드 실패:', error);
            reject(new Error('카카오맵 스크립트 로드 실패'));
        };
        document.head.appendChild(script);
    });
}

// 구글맵 스크립트 동적 로드
function loadGoogleMapScript() {
    return new Promise((resolve, reject) => {
        if (window.google && window.google.maps) {
            resolve();
            return;
        }

        const script = document.createElement('script');
        const scriptUrl = `https://maps.googleapis.com/maps/api/js?key=${googleApiKey}&libraries=places&loading=async`;

        script.src = scriptUrl;
        script.async = true;
        script.defer = true;
        script.onload = () => {
            console.log('구글맵 초기화 완료');
            resolve();
        };
        script.onerror = (error) => {
            console.error('구글맵 스크립트 로드 실패:', error);
            reject(new Error('구글맵 스크립트 로드 실패'));
        };
        document.head.appendChild(script);
    });
}

// 카카오맵 초기화
function initKakaoMap() {
    const container = document.getElementById('kakaoMap');
    const options = {
        center: new kakao.maps.LatLng(37.5665, 126.9780), // 서울 시청
        level: 3
    };

    kakaoMap = new kakao.maps.Map(container, options);
    geocoder = new kakao.maps.services.Geocoder();
    places = new kakao.maps.services.Places();

    // 지도 크기 재조정 (컨테이너 크기 인식)
    setTimeout(() => {
        kakaoMap.relayout();
    }, 100);

    // 지도 클릭 이벤트
    kakao.maps.event.addListener(kakaoMap, 'click', function(mouseEvent) {
        const latlng = mouseEvent.latLng;
        const lat = latlng.getLat();
        const lng = latlng.getLng();

        currentPosition = { lat, lng };
        updateKakaoMarker(latlng);
        getAddressFromKakaoCoords(latlng);

        // 구글맵도 같은 위치로 업데이트 (사용 가능한 경우)
        if (availableMaps.google && googleMap) {
            updateGoogleMapPosition(lat, lng);
        }
    });
}

// 구글맵 초기화
function initGoogleMap() {
    const container = document.getElementById('googleMap');
    const options = {
        center: { lat: 37.5665, lng: 126.9780 }, // 서울 시청
        zoom: 15
    };

    googleMap = new google.maps.Map(container, options);

    // 지도 클릭 이벤트
    googleMap.addListener('click', (event) => {
        const lat = event.latLng.lat();
        const lng = event.latLng.lng();

        currentPosition = { lat, lng };
        updateGoogleMarker(event.latLng);
        getAddressFromGoogleCoords(lat, lng);

        // 카카오맵도 같은 위치로 업데이트 (사용 가능한 경우)
        if (availableMaps.kakao && kakaoMap) {
            updateKakaoMapPosition(lat, lng);
        }
    });
}

// 카카오맵 마커 업데이트
function updateKakaoMarker(position) {
    if (kakaoMarker) {
        kakaoMarker.setMap(null);
    }

    kakaoMarker = new kakao.maps.Marker({
        position: position,
        map: kakaoMap
    });

    // 좌표 정보 업데이트
    const lat = position.getLat().toFixed(7);
    const lng = position.getLng().toFixed(7);
    updateCoordinateDisplay(lat, lng);
}

// 구글맵 마커 업데이트
function updateGoogleMarker(position) {
    if (googleMarker) {
        googleMarker.setMap(null);
    }

    googleMarker = new google.maps.Marker({
        position: position,
        map: googleMap
    });

    // 좌표 정보 업데이트
    const lat = position.lat().toFixed(7);
    const lng = position.lng().toFixed(7);
    updateCoordinateDisplay(lat, lng);
}

// 좌표 표시 업데이트
function updateCoordinateDisplay(lat, lng) {
    document.getElementById('latText').textContent = lat;
    document.getElementById('lngText').textContent = lng;
    document.getElementById('coordsText').textContent = `${lat}, ${lng}`;
}

// 카카오맵 위치로 구글맵 업데이트
function updateGoogleMapPosition(lat, lng) {
    const position = new google.maps.LatLng(lat, lng);
    googleMap.setCenter(position);

    if (googleMarker) {
        googleMarker.setMap(null);
    }
    googleMarker = new google.maps.Marker({
        position: position,
        map: googleMap
    });
}

// 구글맵 위치로 카카오맵 업데이트
function updateKakaoMapPosition(lat, lng) {
    const position = new kakao.maps.LatLng(lat, lng);
    kakaoMap.setCenter(position);

    if (kakaoMarker) {
        kakaoMarker.setMap(null);
    }
    kakaoMarker = new kakao.maps.Marker({
        position: position,
        map: kakaoMap
    });
}

// 카카오 좌표로 주소 검색
function getAddressFromKakaoCoords(coords) {
    geocoder.coord2Address(coords.getLng(), coords.getLat(), (result, status) => {
        if (status === kakao.maps.services.Status.OK) {
            const address = result[0].address.address_name;
            document.getElementById('addressText').textContent = address;
        } else {
            document.getElementById('addressText').textContent = '주소를 찾을 수 없습니다';
        }
    });
}

// 구글 좌표로 주소 검색
function getAddressFromGoogleCoords(lat, lng) {
    const geocoder = new google.maps.Geocoder();
    const latlng = { lat, lng };

    geocoder.geocode({ location: latlng }, (results, status) => {
        if (status === 'OK' && results[0]) {
            const address = results[0].formatted_address;
            document.getElementById('addressText').textContent = address;
        } else {
            document.getElementById('addressText').textContent = '주소를 찾을 수 없습니다';
        }
    });
}

// 지도 탭 비활성화
function disableMapTab(mapType) {
    const tab = document.querySelector(`[data-map="${mapType}"]`);
    if (tab) {
        tab.disabled = true;
        tab.style.opacity = '0.5';
        tab.style.cursor = 'not-allowed';
        tab.title = `${mapType === 'kakao' ? '카카오맵' : '구글맵'} API 키가 설정되지 않았습니다`;
    }
}

// 주소 및 장소 검색
function searchAddress() {
    const searchInput = document.getElementById('searchInput');
    const keyword = searchInput.value.trim();

    if (!keyword) {
        showToast('검색어를 입력하세요', 'warning');
        return;
    }

    if (!currentMapType) {
        showToast('사용 가능한 지도가 없습니다', 'error');
        return;
    }

    // 위도/경도 패턴 감지 (예: "37.5665, 126.9780" 또는 "37.5665 126.9780")
    const coordPattern = /^(-?\d+\.?\d*)[,\s]+(-?\d+\.?\d*)$/;
    const match = keyword.match(coordPattern);

    if (match) {
        const lat = parseFloat(match[1]);
        const lng = parseFloat(match[2]);

        // 유효한 위도/경도 범위 확인
        if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
            searchByCoordinates(lat, lng);
            return;
        }
    }

    if (currentMapType === 'kakao' && availableMaps.kakao) {
        searchOnKakaoMap(keyword);
    } else if (currentMapType === 'google' && availableMaps.google) {
        searchOnGoogleMap(keyword);
    } else {
        showToast('현재 지도를 사용할 수 없습니다', 'error');
    }
}

// 좌표로 직접 검색
function searchByCoordinates(lat, lng) {
    currentPosition = { lat, lng };

    if (currentMapType === 'kakao' && availableMaps.kakao) {
        const coords = new kakao.maps.LatLng(lat, lng);
        kakaoMap.setCenter(coords);
        updateKakaoMarker(coords);
        getAddressFromKakaoCoords(coords);

        // 구글맵 동기화
        if (availableMaps.google && googleMap) {
            updateGoogleMapPosition(lat, lng);
            getAddressFromGoogleCoords(lat, lng);
        }
    } else if (currentMapType === 'google' && availableMaps.google) {
        const position = new google.maps.LatLng(lat, lng);
        googleMap.setCenter(position);
        updateGoogleMarker(position);
        getAddressFromGoogleCoords(lat, lng);

        // 카카오맵 동기화
        if (availableMaps.kakao && kakaoMap) {
            updateKakaoMapPosition(lat, lng);
            getAddressFromKakaoCoords(new kakao.maps.LatLng(lat, lng));
        }
    }

    showToast('좌표로 이동했습니다', 'success');
}

// 카카오맵에서 검색
function searchOnKakaoMap(keyword) {
    // 먼저 키워드(장소명) 검색 시도
    places.keywordSearch(keyword, (result, status) => {
        if (status === kakao.maps.services.Status.OK && result.length > 0) {
            // 키워드 검색 성공
            const place = result[0];
            const coords = new kakao.maps.LatLng(place.y, place.x);
            const lat = parseFloat(place.y);
            const lng = parseFloat(place.x);

            currentPosition = { lat, lng };

            // 지도 중심 이동
            kakaoMap.setCenter(coords);

            // 마커 표시 및 정보 업데이트
            updateKakaoMarker(coords);

            // 좌표로 주소 가져오기
            getAddressFromKakaoCoords(coords);

            // 구글맵도 동기화 (사용 가능한 경우)
            if (availableMaps.google && googleMap) {
                updateGoogleMapPosition(lat, lng);
            }

            showToast(`'${place.place_name}' 을(를) 찾았습니다`, 'success');
        } else {
            // 키워드 검색 실패 시 주소 검색 시도
            geocoder.addressSearch(keyword, (result, status) => {
                if (status === kakao.maps.services.Status.OK) {
                    const coords = new kakao.maps.LatLng(result[0].y, result[0].x);
                    const lat = parseFloat(result[0].y);
                    const lng = parseFloat(result[0].x);

                    currentPosition = { lat, lng };

                    // 지도 중심 이동
                    kakaoMap.setCenter(coords);

                    // 마커 표시 및 정보 업데이트
                    updateKakaoMarker(coords);
                    document.getElementById('addressText').textContent = result[0].address_name;

                    // 구글맵도 동기화 (사용 가능한 경우)
                    if (availableMaps.google && googleMap) {
                        updateGoogleMapPosition(lat, lng);
                    }

                    showToast('주소를 찾았습니다', 'success');
                } else {
                    showToast('검색 결과를 찾을 수 없습니다. 다시 시도해주세요.', 'error');
                }
            });
        }
    });
}

// 구글맵에서 검색
function searchOnGoogleMap(keyword) {
    const service = new google.maps.places.PlacesService(googleMap);

    const request = {
        query: keyword,
        fields: ['name', 'geometry', 'formatted_address']
    };

    service.findPlaceFromQuery(request, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results && results.length > 0) {
            const place = results[0];
            const location = place.geometry.location;
            const lat = location.lat();
            const lng = location.lng();

            currentPosition = { lat, lng };

            // 지도 중심 이동
            googleMap.setCenter(location);

            // 마커 표시
            updateGoogleMarker(location);

            // 주소 표시
            if (place.formatted_address) {
                document.getElementById('addressText').textContent = place.formatted_address;
            } else {
                getAddressFromGoogleCoords(lat, lng);
            }

            // 카카오맵도 동기화 (사용 가능한 경우)
            if (availableMaps.kakao && kakaoMap) {
                updateKakaoMapPosition(lat, lng);
            }

            showToast(`'${place.name}' 을(를) 찾았습니다`, 'success');
        } else {
            showToast('검색 결과를 찾을 수 없습니다. 다시 시도해주세요.', 'error');
        }
    });
}

// 지도 전환
function switchMap(mapType) {
    // 사용 가능한 지도인지 확인
    if (!availableMaps[mapType]) {
        showToast(`${mapType === 'kakao' ? '카카오맵' : '구글맵'}을 사용할 수 없습니다`, 'error');
        return;
    }

    currentMapType = mapType;

    // 탭 active 상태 변경
    document.querySelectorAll('.map-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelector(`[data-map="${mapType}"]`).classList.add('active');

    // 지도 뷰 변경
    document.querySelectorAll('.map-view').forEach(view => {
        view.classList.remove('active');
    });

    if (mapType === 'kakao') {
        document.getElementById('kakaoMap').classList.add('active');
        setTimeout(() => {
            kakaoMap.relayout();
            if (currentPosition) {
                const position = new kakao.maps.LatLng(currentPosition.lat, currentPosition.lng);
                kakaoMap.setCenter(position);
            }
        }, 100);
    } else if (mapType === 'google') {
        document.getElementById('googleMap').classList.add('active');
        setTimeout(() => {
            google.maps.event.trigger(googleMap, 'resize');
            if (currentPosition) {
                const position = new google.maps.LatLng(currentPosition.lat, currentPosition.lng);
                googleMap.setCenter(position);
            }
        }, 100);
    }

    showToast(`${mapType === 'kakao' ? '카카오맵' : '구글맵'}으로 전환되었습니다`, 'info');
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

    // 지도 탭 전환
    document.querySelectorAll('.map-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            // 비활성화된 탭은 클릭 무시
            if (tab.disabled) {
                return;
            }
            const mapType = tab.getAttribute('data-map');
            switchMap(mapType);
        });
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
