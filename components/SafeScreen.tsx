import { View, StyleSheet, Text } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import COLORS from '@/constants/colors'



const SafeScreen = ({children}: {children: React.ReactNode}) => {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.container, {
      paddingTop: insets.top
    }]}>
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  }
})

export default SafeScreen