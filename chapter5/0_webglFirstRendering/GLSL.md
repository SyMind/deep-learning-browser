# GLSL

## 基本类型

void
bool
int
float
vec2, vec3, vec4
bvec2, bvec3, bvec4
ivec2, ivec3, ivec4
mat2, mat3, mat4
sampler2D
samplerCube

## 变量限定符

none - （默认的可省略）本地变量，可读可写，函数的输入参数既是这种类型。
const - 声明变量或函数的参数为只读类型。
attribute - 只能存在于 vertex shader 中，一般用于保存顶点或法线数据，它可以在数据缓冲区中读取数据。
uniform - 在运行时 shader 无法改变 uniform 变量，一般用来放置程序传递给 shader 的变换矩阵，材质，光照参数等等。
varying - 主要负责在 vertex 和 fragment 之间传递变量。

## 精度限定

GLSL 在进行光栅化着色的时候会产生大量的浮点数运算，这些运算可能是当前设备所不能承受的,所以 GLSL 提供了3种浮点数精度，我们可以根据不同的设备来使用合适的精度。

在变量前面加上 `highp` `mediump` `lowp` 即可完成对该变量的精度声明。

一般在片元着色器（fragment shader）最开始的地方加上 precision mediump float; 便设定了默认的精度。这样所有没有显式表明精度的变量，都会按照设定好的默认精度来处理。

## 内置特殊变量

GLSL 程序使用一些特殊的内置变量与硬件进行沟通。他们大致分成两种：一种是 input 类型，他负责向硬件（渲染管线）发送数据。
另一种是 output 类型，负责向程序回传数据，以便编程时需要。

### 在 vertex Shader 中

#### input 类型的内置变量

highp vec4 gl_Position - gl_Position 放置顶点坐标信息
mediump float gl_PointSize - gl_PointSize 需要绘制点的大小（只在 gl.POINTS 模式下有效）

### 在 fragment Shader 中

#### input 类型的内置变量

mediump vec4 gl_FragCoord - 片元在 framebuffer 画面的相对位置
bool gl_FrontFacing - 标志当前图元是不是正面图元的一部分
mediump vec2 gl_PointCoord - 经过插值计算后的纹理坐标，点的范围是 0.0 到 1.0

#### output 类型的内置变量

mediump vec4 gl_FragColor - 设置当前片点的颜色
mediump vec4 gl_FragData[n] - 设置当前片点的颜色,使用glDrawBuffers数据数组