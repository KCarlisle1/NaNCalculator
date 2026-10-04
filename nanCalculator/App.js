import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, Image, Modal, Pressable, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'; //the non-legacy one
import { useState } from 'react';
import { MaterialIcons } from '@expo/vector-icons'; //adds essential app icons
import { useFonts, Aldrich_400Regular } from '@expo-google-fonts/aldrich'; //imports aldrich google font

export default function App() {

  const [input, setInput] = useState('');
  const [result, setResult] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [nanMessage, setNanMessage] = useState('');
  const [nanCount, setNanCount] = useState(0);
  const [divZeroCount, setDivZeroCount] = useState(0);
  const [sqrtNegCount, setSqrtNegCount] = useState(0);
  const [showInstructions, setShowInstructions] = useState(false);
  
  const [fontsLoaded] = useFonts({
    Aldrich_400Regular,
  });

  if (!fontsLoaded) {
    return null;
  }

  const handleButton = (value) => { //calculator button logic
    if(value === '='){
      calculate();
    }
    else if(value === '⌫'){
      setInput(input.slice(0, -1));
    }
    else{
      setInput(input + value);
    }
  };

  const calculate = () => {
    try {
      let expression = input;

      expression = expression.replace(/√(-?\d+(\.\d+)?)/g, 'Math.sqrt($1)'); //regex to allow sqrt functionality
      expression = expression.replace(/log/g, 'Math.log');

      const res = eval(expression);

      if (Number.isNaN(res) || !Number.isFinite(res)) {
        
        let explanationObj ={
          explanation: '',
          fix: '',
        };

        if (expression.includes('/0')) {
          explanationObj = {
            explanation: "Division by zero is undefined in standard mathematics, as a number cannot be split into zero parts.",
            fix: "Try using a non-zero divisor, e.g. 10 / 2."
          };
          setDivZeroCount(prev => prev + 1);
        } 
        else if (expression.includes('Math.sqrt(-')) {
          explanationObj = {
            explanation: "Taking the square root of a negative number requires imaginary numbers, which are not supported.",
            fix: "Try using a positive number, e.g. √4."
          };
          setSqrtNegCount(prev => prev + 1);
        }
        else if(!expression){
          explanationObj = {
            explanation: "You didn't enter any input, therefore resulting in an absence of a number.",
            fix: "Try attempting an operation with the calculator provided, e.g. 4 * 4."
          }
        }
        else {
          explanationObj = {
            explanation: "This operation does not produce a number defined in standard mathematics.",
            fix: "Check your input for invalid operations and try again."
          };
        }

        setNanMessage(explanationObj);
        setNanCount(prev => prev + 1);
        setResult('NaN');
        setShowModal(true);
        return;
      }

      setResult(res.toString());

    } catch (err) {
      setResult('Error');
      setNanCount(prev => prev + 1);
      setNanMessage({
        explanation: "There is a syntax error in your expression, meaning the calculator could not respond with a number.",
        fix: "Check your input. Ensure operators are followed by supported numbers or symbols and try again."
      });
      setShowModal(true);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.container}>
          
          {/*title bar*/}
          <View style={styles.titleBar}>
            <Image style={styles.appIcon} source={require('./assets/nanicon.png')} />
            <Text style={styles.title}>Not a Number</Text>
            <TouchableOpacity style={styles.infoBtn} onPress={() => setShowInstructions(true)}>
              <MaterialIcons name="info-outline" size={30} color="#fff" />
            </TouchableOpacity>
          </View>

          {/*input/output*/}
          <View style={styles.displayContainer}>
            <Text style={styles.label}>INPUT</Text>
            <View style={styles.inputBox}>
              <Text style={styles.inputText}>{input || ''}</Text>
            </View>

            <Text style={styles.label}>RESULT</Text>
            <View style={styles.resultBox}>
              <Text style={styles.resultText}>{result}</Text>
            </View>
          </View>

          {/*calculator*/}
          <View style={styles.calcGrid}>
            {[
              ['1', '2', '3', '+'],
              ['4', '5', '6', '-'],
              ['7', '8', '9', '*'],
              ['0','√' , '.' , '/'],
              ['⌫', '='],
            ].map((row, rowIndex) => (
              <View key={rowIndex} style={styles.row}>
                {row.map((item, colIndex) => (
                  <TouchableOpacity key={colIndex} style={styles.numButton} onPress={() => handleButton(item)}>
                    <Text style={[styles.numButtonText, item === '=' && {color: '#72ff6b'}, item === '⌫' && {color: '#ff6b6b'}]}>{item}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </View>

          {/*clear button*/}
          <View style={styles.bottomRow}>
            <TouchableOpacity style={styles.clearButton} onPress={() => { setInput(''); setResult(''); }}>
              <Text style={styles.clearText}>Clear</Text>
            </TouchableOpacity>
          </View>

          <Modal animationType="slide" transparent={true} visible={showModal} onRequestClose={() => setShowModal(false)}>
            <View style={styles.modalBackground}>
              <View style={styles.modalBox}>
                <Text style={styles.modalTitle}>Why is this NaN?</Text>
                <Text style={styles.modalExplain}>
                  You tried:{'\n\n'}
                  <Text style={styles.modalInput}>{input || 'unknown'}</Text>
                  {'\n\n'}
                  <Text style={styles.modalLabel}>Explanation:</Text>{'\n'}
                  <Text style={styles.modalText}>{nanMessage.explanation}</Text>{'\n\n'}
                  <Text style={styles.modalLabel}>Fix:</Text>{'\n'}
                  <Text style={styles.modalText}>{nanMessage.fix}</Text>{'\n'}{'\n'}
                  <Text style={styles.modalLabel}>Your NaN Stats:</Text>{'\n'}
                  <Text style={styles.modalText}>• Total NaNs recieved: {nanCount}</Text>{'\n'}
                  <Text style={styles.modalText}>• Divisions by zero: {divZeroCount}</Text>{'\n'}
                  <Text style={styles.modalText}>• Illegal square roots: {sqrtNegCount}</Text>
                </Text>
                <Pressable onPress={() => setShowModal(false)} style={styles.modalCloseBox}>
                  <Text style={styles.modalCloseText}>Close</Text>
                </Pressable>
              </View>
            </View>
          </Modal>

          <Modal animationType="fade" transparent={true} visible={showInstructions} onRequestClose={() => setShowInstructions(false)}>
            <View style={styles.modalBackground}>
              <View style={styles.modalBox}>
                <Text style={styles.modalTitle}>NaN Calculator Instructions:</Text>

                <Text style={styles.modalExplain}>
                  • Enter numbers and operators using the calculator buttons.{'\n'}
                  • Supports basic operations: +, -, *, / etc.{'\n'}
                  • Use "√" for square roots (e.g., √4).{'\n'}
                  • Press "=" to calculate.{'\n'}
                  • "⌫" deletes the last input.{'\n'}
                  • Clear button resets the input and result.{'\n\n'}
                  <Text style={styles.modalLabel}>The app explains invalid calculations (NaN), explains their origin and suggests fixes.</Text>
                </Text>
                <Pressable style={styles.modalCloseBox} onPress={() => setShowInstructions(false)}>
                  <Text style={styles.modalCloseText}>Close</Text>
                </Pressable>
              </View>
            </View>
          </Modal>

          <StatusBar style="auto" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const { width } = Dimensions.get('window');
const styles = StyleSheet.create({

  safeArea:{
    flex: 1,
    backgroundColor: '#121212'
  },

  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: '3%',
  },

    titleBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 20,
    padding: '3%',
    borderBottomColor: '#fff',
    borderBottomWidth: 1,
  },

  appIcon: {
    width: width * 0.1,
    height: width * 0.1,
    borderRadius: 5,
  },

  title: {
    fontSize: width * 0.07,
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
    fontFamily: 'Aldrich_400Regular'
  },

  displayContainer: {
    marginVertical: 20,
  },

  label: {
    color: '#aaa',
    fontSize: width * 0.04,
    marginBottom: 4,
  },

  inputBox: {
    backgroundColor: '#1e1e1e',
    padding: 12,
    borderRadius: 10,
    marginBottom: 20,
  },

  inputText: {
    color: '#fff',
    fontSize: width * 0.045,
    fontFamily: 'Aldrich_400Regular'
  },

  resultBox: {
    backgroundColor: '#1e1e1e',
    padding: 16,
    borderRadius: 10,
    marginBottom: 20,
  },

  resultText: {
    color: '#ff6b6b',
    fontSize: width * 0.05,
    fontFamily: 'Aldrich_400Regular'
  },

  calcGrid: {
    flex: 1,
    justifyContent: 'center',
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },

  numButton: {
    backgroundColor: '#2a2a2a',
    flex: 1,
    marginHorizontal: 5,
    paddingVertical: width * 0.05,
    borderRadius: 10,
    alignItems: 'center',
  },

  numButtonText: {
    color: '#fff',
    fontSize: width * 0.045,
  },

  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },

  clearButton: {
    backgroundColor: '#444',
    padding: 12,
    borderRadius: 10,
    width: '30%',
    alignItems: 'center',
  },
  
  clearText: {
    color: '#ff6b6b',
    fontSize: width * 0.05,
    fontFamily: 'Aldrich_400Regular'
  },

  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 20
  },

  modalBox: {
    backgroundColor: '#1e1e1e',
    borderRadius: 15,
    padding: 25,
    width: '100%',
  },

  modalTitle: {
    color: '#fff', 
    fontSize: width * 0.05, 
    marginBottom: 20,
    fontFamily: 'Aldrich_400Regular',
    textDecorationLine: 'underline',
    textDecorationColor: '#ccc',
  },

  modalExplain: {
    color: '#ccc', 
    fontSize: width * 0.04, 
    marginBottom: 30,
    lineHeight: 20
  },

  modalInput: {
    fontFamily: 'Aldrich_400Regular',
    color: '#72ff6b'
  },

  modalLabel: {
    fontFamily: 'Aldrich_400Regular',
    color: '#fff',
    lineHeight: 20
  },

  modalText: {
    color: '#ccc'
  },

  modalCloseBox: {
    backgroundColor: '#ff6b6b',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },

  modalCloseText: {
    color: '#fff', 
    fontWeight: 'bold', 
    fontSize: width * 0.045
  },
  
});