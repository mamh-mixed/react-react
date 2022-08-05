let React;
let Offscreen;
let ReactDOMClient;
let act;

describe('ReactOffscreenStrictMode', () => {
  let log;

  beforeEach(() => {
    jest.resetModules();
    log = [];

    React = require('react');
    Offscreen = React.unstable_Offscreen;
    ReactDOMClient = require('react-dom/client');
    act = require('jest-react').act;

    const ReactFeatureFlags = require('shared/ReactFeatureFlags');
    ReactFeatureFlags.enableStrictEffects = __DEV__;
  });

  function Component({label}) {
    React.useEffect(() => {
      log.push(`${label}: useEffect mount`);
      return () => log.push(`${label}: useEffect unmount`);
    });

    React.useLayoutEffect(() => {
      log.push(`${label}: useLayoutEffect mount`);
      return () => log.push(`${label}: useLayoutEffect unmount`);
    });

    log.push(`${label}: render`);

    return null;
  }

  if (__DEV__) {
    // @gate enableOffscreen
    it('should trigger strict effects when offscreen is visible', () => {
      const container = document.createElement('div');
      const root = ReactDOMClient.createRoot(container, {
        unstable_strictMode: true,
      });

      act(() => {
        root.render(
          <Offscreen mode="visible">
            <Component label="A" />
          </Offscreen>,
        );
      });

      expect(log).toEqual([
        'A: render',
        'A: render',
        'A: useLayoutEffect mount',
        'A: useEffect mount',
        'A: useLayoutEffect unmount',
        'A: useEffect unmount',
        'A: useLayoutEffect mount',
        'A: useEffect mount',
      ]);
    });

    // @gate enableOffscreen
    it('should not trigger strict effects when offscreen is hidden', () => {
      const container = document.createElement('div');
      const root = ReactDOMClient.createRoot(container, {
        unstable_strictMode: true,
      });

      act(() => {
        root.render(
          <Offscreen mode="hidden">
            <Component label="A" />
          </Offscreen>,
        );
      });

      expect(log).toEqual(['A: render', 'A: render']);
    });
  }

  // @gate enableOffscreen
  it('should default to no strinct effects', () => {
    const container = document.createElement('div');
    const root = ReactDOMClient.createRoot(container);

    act(() => {
      root.render(
        <Offscreen mode="hidden">
          <Component label="A" />
        </Offscreen>,
      );
    });

    expect(log).toEqual(['A: render']);
  });
});
