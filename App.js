import {StatusBar} from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {ScrollView, StyleSheet, Text, Dimensions, View, ActivityIndicator} from 'react-native';
import * as Location from 'expo-location';
import { MaterialCommunityIcons } from '@expo/vector-icons';


const {width: SCREEN_WIDTH} = Dimensions.get('window');

const API_KEY = "c489a35d426ada8371a09efbbdea056f"; // api키를 코드와 같이 두면 해킹의 위험이 있기때문에 보통의 경우 서버에 요청하는 방식을 사용한다

const icons = {
  Clouds: "weather-cloudy",
  Clear: "weather-sunny",
  Rain: "weather-pouring",
  Snow: "weather-snowy-heavy",
  Thunderstorm: "weather-lightning",
  Drizzle: "weather-rainy",
  Atmosphere: "weather-windy",
}

export default function App() {
  const [city, setCity] = useState("Loading...");
  const [hourlys, setHourlys] = useState([]);
  const [days, setDays] = useState([]);
  const [ok, setOk] = useState(true); //허가 여부를 저장한다
  const ask = async () => {
    const { granted } = await Location.requestForegroundPermissionsAsync();
    if(!granted) {
      setOk(false);
    } // 만약 위치사용에 대한 거부를 할경우 표시할것을 작성
    const {coords:{latitude, longitude}} = await Location.getCurrentPositionAsync({accuracy:5}); // 1.함수를 location에 담아서 consol.log를통해 내용을 확인 2.위치에 대한 내부 위도와 경도를 추출
    const location = await Location.reverseGeocodeAsync({latitude, longitude }, {useGoogleMaps:false}); // reverseGeocodeAsync을 통해서 좌표를 통해 위치 확인
    setCity(location[0].city); // setCity의 값을 location[0].city의 값으로 저장
    const response = await fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${latitude}&lon=${longitude}&exclude=alerts&appid=${API_KEY}&units=metric`) //fetch를 통해 외부 값을 가지고 온다
    const json = await response.json(); // 가지고 온 값을 json값으로 변경해서 읽을수 있는 형태로 바꾼다
    setDays(json.daily); // 읽은 값을 setDays에 저장하여 사용 한다
    setHourlys(json.hourly);
  }; // 위치 사용에 대한 권한을 허락받는 함수
  
  useEffect(() =>  {
    ask();
  }, []); // 새로 고침시 ask() 함수를 호출

  function styling(x) {
    if(x<0) {
      return "매우 추운 날시입니다. 패딩을 챙겨 입으세요"
    }else if(x<5){
      return "추운날씨입니다. 차가운 바람이 들지 않는 두꺼운옷을 입으세요"
    }else if(x<10){
      return "조금 추운 날씨입니다. 맨투맨이나 후드를 추천드립니다."
    }else if(x<15){
      return "선선한 날씨입니다. 긴팔 티셔츠를 추천드립니다."
    }else if(x<20){
      return "조금 덥운 날씨입니다. 가벼운 차림을 추천드립니다."
    }else if(x<25){
      return "덥고 힘든 날씨입니다. 가벼운 반팔, 반바지를 추천드립니다."
    }else if(x<30){
      return "매우 더운 날씨입니다. 에어컨 밑으로 도망치십시오"
    }
  }
    return (
        <View style={styles.container}>
          <View style={styles.city}>
            <Text style={styles.cityName}>{city}</Text>
          </View>
          <ScrollView showsHorizontalScrollIndicator="false" pagingEnabled horizontal>
            {days.length === 0 ? ( //days의 값이 0일 경우
              <View style={styles.day}>
                <ActivityIndicator color="black" size="large" />
              </View> // 값이 0 일경우 activityIndicator을 화면에 표시 - 로딩화면
            ) : (
            days.map((day, index) => 
            <View key={index} style={styles.day}>
              <View style={{flexDirection: 'row', alignItems: 'center', justifyContent:'space-between'}}>
              <Text style={styles.temp}>{parseFloat(day.temp.day).toFixed(1)}</Text>
              <MaterialCommunityIcons name={icons[day.weather[0].main]} size={90} color="black" />
              </View>
              <Text style={styles.description}>{day.weather[0].main}</Text>
              <View style={styles.Direction}>
              <Text style={styles.tinyText}>{day.weather[0].description}</Text>
              <Text style={styles.smallTemp}>{parseFloat(day.temp.max).toFixed(1)}: MAX</Text>
              </View>
              <View style={styles.Direction}>
              <Text style={styles.tinyText}>{new Date(day.dt * 1000).toString().substring(0, 10)}</Text>
              <Text style={styles.smallTemp}>{parseFloat(day.temp.min).toFixed(1)}:  MIN</Text>
              </View>
              <View style={styles.styles}>
                <Text style={styles.styleText}>{styling(day.temp.day)}</Text>
              </View>
            </View>) //값이 0이 아닐경우 위와 받아온 값을 출력
            )}
          </ScrollView>
          {days.length === 0 ? (
          <View></View>
          ) : (
            <Text style={styles.hourTemp}>temp per hour</Text>
          )}
          <ScrollView showsHorizontalScrollIndicator="false" pagingEnabled horizontal contentContainerStyle={styles.weather}>
            {hourlys.length === 0 ? (
              <View></View>
            ) : (
              hourlys.map((hour, index) =>
            <View key={index} style={styles.weathers}>
                <Text>{new Date(hour.dt * 1000).getMonth()+1}월{new Date(hour.dt * 1000).toString().substring(7,10)}일</Text>
                <Text>{new Date(hour.dt * 1000).toString().substring(15,18)}시</Text>
                <Text style={styles.hourTemp}>{parseFloat(hour.temp).toFixed(1)}</Text>
                <MaterialCommunityIcons name={icons[hour.weather[0].main]} size={40} color="black" />
                <Text>{hour.weather[0].main}</Text>
            </View>
                )
              )}
          </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "orange",
  },
  city: {
    flex: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cityName: {
    fontSize: 78,
    fontWeight: "500",
  },
  weather: {
  },
  weathers: {
    width: SCREEN_WIDTH/5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  day: {
    width: SCREEN_WIDTH,
  },
  styles: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  styleText: {
    marginTop: 20,
    marginBottom: -30,
    fontSize: 15,
    fontWeight: "800"
  },
  Direction: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  temp: {
    marginTop: 20,
    fontSize: 130,
    fontWeight: "500",
  },
  smallTemp: {
    fontSize: 18,
    fontWeight: "500",
  },
  hourTemp: {
    fontSize: 20,
    fontWeight: "500"
  },
  description: {
    fontSize: 58,
    marginTop: -30
  },
  tinyText: {
    fontSize: 20,
  },
    });
