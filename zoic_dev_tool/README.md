<p align="center"><img style="display: block;
  margin-left: auto;
  margin-right: auto;" src="zoic_clear.png" width = "300px" alt="Zoic logo">
</p>
<hr>
  <br>
    <h3 align="center">Developer Tool</h3>
  <br>
<hr>

## Table of Contents
1. [Description](#description)
2. [Installation](#installation)
3. [Usage and Configuration](#usage)
4. [Authors](#authors)


## <a name="description"></a>Description

The Zoic Developer Tool is a Chrome Developer Tools extension for monitoring metrics in a ZoicCache instance. With the Zoic Developer Tool, you can monitor and inspect memory usage, reads processed, writes proccesed, latency, and more.

## <a name="installation"></a>Installation

The Zoic Developer Tool is currently available as a Chrome Developer Tools extension. The easiest way to install it is to [add it from the Chrome Web Store.](http://heheh.com)

The latest build can also be added manually as a Chrome extension.

In the Chrome Extensions Page (`chrome://extensions/`), click on "Load unpacked" and navigate to `.../zoic/zoic_dev_tool/` and click "Select". (You may need to toggle on "Developer mode" to do this.) The extension should now be loaded and available in the Chrome Developer Tools.

## <a name="#usage"></a>Usage and Configuration

To configure the dev tools, you must first link your server address via the input field on the dev tool panel.
- First: Specify your server address, and endpoint at which you will serve the cache metrics from. (Ex: `http://localhost:3000/getZoicMetrics`)
- Second: In your server routes, create a new route matching the endpoint specified in the dev tool. In this route add middleware `Zoic.getMetrics`.


NOTE: This route WILL have CORS enabled.

#### Example configuration:
```typescript
const cache = new Zoic();

router.get('/getZoicMetrics', cache.getMetrics);
```

## <a name="authors"></a>Authors

- [Joe Borrow](https://github.com/jmborrow)
- [Celena Chan](https://github.com/celenachan)
- [Aaron Dreyfuss](https://github.com/AaronDreyfuss)
- [Hank Jackson](https://github.com/hankthetank27)
- [Jasper Narvil](https://github.com/jnarvil3)
