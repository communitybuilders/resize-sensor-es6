## Resize Sensor

Extracts the Resize sensor out of [CSS Element Queries](https://github.com/marcj/css-element-queries)

## Quick Use

```js
const sensor = new ResizeSensor(element, () => {
	console.log('anything inside of element caused my size to change');
})
```

## Remove the Listener

```js
sensor.detach();
```

or

```js	
ResizeSensor.detach(element);
```
