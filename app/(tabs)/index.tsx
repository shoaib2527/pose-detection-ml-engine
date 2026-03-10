import { Canvas, Circle, Line, vec } from '@shopify/react-native-skia';
import React, { useState } from 'react';
import { Dimensions, Platform, StyleSheet, Text, View } from 'react-native';
import { useTensorflowModel } from 'react-native-fast-tflite';
import { Camera, useCameraDevice, useFrameProcessor } from 'react-native-vision-camera';
import { useSharedValue, Worklets } from 'react-native-worklets-core';
import { useResizePlugin } from 'vision-camera-resize-plugin';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SQUARE_SIZE = SCREEN_WIDTH;

export default function SkeletonDebugger() {
  const device = useCameraDevice('front');
  const { resize } = useResizePlugin();
  const plugin = useTensorflowModel(require('../../assets/movenet.tflite'), Platform.OS === 'ios' ? 'core-ml' : 'android-gpu');
  const model = plugin.state === 'loaded' ? plugin.model : undefined;

  // --- Shared Values ---
  const nose = useSharedValue({ x: 0, y: 0, s: 0 });
  const lShoulder = useSharedValue({ x: 0, y: 0, s: 0 });
  const rShoulder = useSharedValue({ x: 0, y: 0, s: 0 });
  const lElbow = useSharedValue({ x: 0, y: 0, s: 0 }); // Added
  const rElbow = useSharedValue({ x: 0, y: 0, s: 0 }); // Added
  const lWrist = useSharedValue({ x: 0, y: 0, s: 0 }); // Added
  const rWrist = useSharedValue({ x: 0, y: 0, s: 0 }); // Added
  const lHip = useSharedValue({ x: 0, y: 0, s: 0 });
  const rHip = useSharedValue({ x: 0, y: 0, s: 0 });
  const lKnee = useSharedValue({ x: 0, y: 0, s: 0 });
  const rKnee = useSharedValue({ x: 0, y: 0, s: 0 });
  const lAnkle = useSharedValue({ x: 0, y: 0, s: 0 });
  const rAnkle = useSharedValue({ x: 0, y: 0, s: 0 });

  const [debugInfo, setDebugInfo] = useState("Initializing...");
  const updateDebug = Worklets.createRunOnJS((msg) => setDebugInfo(msg));

  const frameProcessor = useFrameProcessor((frame) => {
    'worklet';
    if (model == null) return;

    const resized = resize(frame, {
      scale: { width: 192, height: 192 },
      pixelFormat: 'rgb',
      dataType: 'uint8',
      rotation: '270deg',
    });

    const output = model.runSync([resized]);
    const data = output[0];
    if (!data || data.length < 51) return;

    const mapPoint = (yIdx, xIdx, sIdx) => {
      'worklet';
      return {
        x: (1 - data[xIdx]) * SQUARE_SIZE,
        y: data[yIdx] * SQUARE_SIZE,
        s: data[sIdx]
      };
    };

    // Update all points including Arms
    nose.value = mapPoint(0, 1, 2);
    lShoulder.value = mapPoint(15, 16, 17);
    rShoulder.value = mapPoint(18, 19, 20);
    lElbow.value = mapPoint(21, 22, 23); // New index
    rElbow.value = mapPoint(24, 25, 26); // New index
    lWrist.value = mapPoint(27, 28, 29); // New index
    rWrist.value = mapPoint(30, 31, 32); // New index
    lHip.value = mapPoint(33, 34, 35);
    rHip.value = mapPoint(36, 37, 38);
    lKnee.value = mapPoint(39, 40, 41);
    rKnee.value = mapPoint(42, 43, 44);
    lAnkle.value = mapPoint(45, 46, 47);
    rAnkle.value = mapPoint(48, 49, 50);

    if (Math.random() < 0.1) {
      updateDebug(`Nose Conf: ${nose.value.s.toFixed(2)}`);
    }
  }, [model]);

  const Bone = ({ p1, p2 }) => (
    <Line
      p1={vec(p1.value.x, p1.value.y)}
      p2={vec(p2.value.x, p2.value.y)}
      color="rgba(255, 255, 255, 0.4)"
      strokeWidth={2}
    />
  );

  const Joint = ({ point, color = "lime" }) => (
    <Circle
      cx={point.value.x}
      cy={point.value.y}
      r={8}
      color={point.value.s > 0.3 ? color : "red"}
    />
  );

  if (!device) return <View style={styles.container}><Text>No Camera</Text></View>;

  return (
    <View style={styles.container}>
      <View style={styles.cameraContainer}>
        <Camera
          style={StyleSheet.absoluteFill}
          device={device}
          isActive={true}
          frameProcessor={frameProcessor}
          pixelFormat="yuv"
        />

        <Canvas style={StyleSheet.absoluteFill}>
          {/* Arms */}
          <Bone p1={lShoulder} p2={lElbow} />
          <Bone p1={lElbow} p2={lWrist} />
          <Bone p1={rShoulder} p2={rElbow} />
          <Bone p1={rElbow} p2={rWrist} />

          {/* Torso */}
          <Bone p1={lShoulder} p2={rShoulder} />
          <Bone p1={lShoulder} p2={lHip} />
          <Bone p1={rShoulder} p2={rHip} />
          <Bone p1={lHip} p2={rHip} />

          {/* Legs */}
          <Bone p1={lHip} p2={lKnee} />
          <Bone p1={rHip} p2={rKnee} />
          <Bone p1={lKnee} p2={lAnkle} />
          <Bone p1={rKnee} p2={rAnkle} />

          {/* Joints */}
          <Joint point={nose} color="yellow" />
          <Joint point={lShoulder} /><Joint point={rShoulder} />
          <Joint point={lElbow} /><Joint point={rElbow} />
          <Joint point={lWrist} /><Joint point={rWrist} />
          <Joint point={lHip} color='aqua' /><Joint point={rHip} color='aqua' />
          <Joint point={lKnee} /><Joint point={rKnee} />
          <Joint point={lAnkle} color='pink' /><Joint point={rAnkle} color='pink' />
        </Canvas>
      </View>
      <View style={styles.infoArea}>
        <Text style={{ color: 'white' }}>{debugInfo}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111' },
  cameraContainer: {
    width: SQUARE_SIZE,
    height: SQUARE_SIZE,
    marginTop: 60,
    overflow: 'hidden',
    backgroundColor: 'black',
  },
  infoArea: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});