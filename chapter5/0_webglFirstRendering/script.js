/**
*
* This software is released under MIT licence : 
*
* Copyright (c) 2018 Xavier Bourry ( xavier@jeeliz.com )
*
* Permission is hereby granted, free of charge, to any person obtaining a copy
* of this software and associated documentation files (the "Software"), to deal
* in the Software without restriction, including without limitation the rights
* to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
* copies of the Software, and to permit persons to whom the Software is
* furnished to do so, subject to the following conditions:
* 
* The above copyright notice and this permission notice shall be included in all
* copies or substantial portions of the Software.
* 
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
* IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
* FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
* AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
* LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
* OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
* SOFTWARE.
*/

function main(){

    // CREATE WEBGL CONTEXT :
    var myCanvas=document.getElementById('myWebGLCanvas');
    var GL;
    try {
      // antialias
      //    - 如果值为 true，并且实现支持抗锯齿，则绘图缓冲区将使用选择的技术（多样本/超样本）和质量执行抗锯齿。 
      //    - 如果值为 false 或实现不支持抗锯齿，则不执行抗锯齿。
      // depth
      //    - 如果值为 true，拥有至少 16 位的深度缓冲区。如果值为 false，深度缓冲区不可用。
      GL=myCanvas.getContext('webgl', {antialias: false, depth: false});
    } catch(e) {
      alert('You are not WebGL compatible :(');
    }


    // CREATE THE VERTEX BUFFER OBJECTS :
    //declare vertices and indices of a quad :
    var quadVertices = new Float32Array([
      -1, -1, //bottom left corner -> indice 0
      -1, 1,  //top left corner    -> indice 1
      1, 1,   //top right corner   -> indice 2
      1, -1  //bottom right corner -> indice 3
    ]);
    var quadIndices = new Uint16Array([
      0,1,2, //first triangle if made with points of indices 0,1,2
      0,2,3  //second triangle
    ]);

    //send vertices to the GPU :
    // 创建一个 WebGLBuffer 对象。
    // 缓冲对象（有时称为 VBOs）为 GLSL 着色器保存顶点属性数据。
    var quadVerticesVBO= GL.createBuffer();
    // 如果 buffer 是由不同的 WebGLRenderingContext 生成的，会产生一个无效的操作错误。
    // 将给定的 WebGLBuffer 对象绑定到给定的绑定点（目标），可以是 ARRAY_BUFFER，也可以是 ELEMENT_ARRAY_BUFFER。
    // 给定的 WebGLBuffer 对象在其生命周期内只能绑定到 ARRAY_BUFFER 或 ELEMENT_ARRAY_BUFFER 目标中的一个。
    // 试图将一个缓冲区对象绑定到另一个目标将产生无效的操作错误，并且当前绑定将保持不变。
    GL.bindBuffer(GL.ARRAY_BUFFER, quadVerticesVBO);
    // void bufferData(GLenum target, [AllowShared] BufferSource? data, GLenum usage)
    // 为传递的目标当前绑定的 WebGLBuffer 对象的大小设置为为传递的数据的大小，然后将数据的内容写入 buffer 对象。
    // 如果传递的数据为空，则会生成一个无效值错误。
    GL.bufferData(GL.ARRAY_BUFFER, quadVertices, GL.STATIC_DRAW);

    //send indices to the GPU :
    var quadIndicesVBO= GL.createBuffer();
    GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, quadIndicesVBO);
    GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, quadIndices, GL.STATIC_DRAW);


    //CREATE THE SHADER PROGRAM :
    //declare shader sources as string
    var shaderVertexSource="attribute vec2 position;\n"
      +"void main(void){\n"
      +"gl_Position=vec4(position, 0., 1.);\n"
      +"}";
    var shaderFragmentSource="precision highp float;\n"
      +"uniform vec2 resolution;\n"
      +"void main(void){\n"
      +"vec2 pixelPosition=gl_FragCoord.xy/resolution;\n"
      +"gl_FragColor=vec4(pixelPosition, 0.,1.);\n"
      +"}";

    //helper function to compile a shader
    function compile_shader(source, type, typeString) {
      var shader = GL.createShader(type);
      GL.shaderSource(shader, source);
      GL.compileShader(shader);
      if (!GL.getShaderParameter(shader, GL.COMPILE_STATUS)) {
        alert("ERROR IN "+typeString+ " SHADER : " + GL.getShaderInfoLog(shader));
        return false;
      }
      return shader;
    };
    //compile both shader separately
    var shaderVertex=compile_shader(shaderVertexSource, GL.VERTEX_SHADER, "VERTEX");
    var shaderFragment=compile_shader(shaderFragmentSource, GL.FRAGMENT_SHADER, "FRAGMENT");

    var shaderProgram=GL.createProgram();
    GL.attachShader(shaderProgram, shaderVertex);
    GL.attachShader(shaderProgram, shaderFragment);

    //start the linking stage :
    GL.linkProgram(shaderProgram);

    //link attributes :
    var _positionAttributePointer = GL.getAttribLocation(shaderProgram, "position");
    // 在索引处启用顶点属性作为数组
    GL.enableVertexAttribArray(_positionAttributePointer);

    //link uniforms :
    var _resolutionUniform = GL.getUniformLocation(shaderProgram, "resolution");


    //RENDERING TIME !
    //bind VBOs
    GL.bindBuffer(GL.ARRAY_BUFFER, quadVerticesVBO);
    GL.vertexAttribPointer(_positionAttributePointer, 2, GL.FLOAT, false, 8,0);
    GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, quadIndicesVBO);

    //rendering :
    GL.useProgram(shaderProgram);
    //update GLSL "resolution" value in the fragment shader :
    GL.viewport(0,0,myCanvas.width, myCanvas.height);
    //update GLSL "resolution" value in the fragment shader :
    GL.uniform2f(_resolutionUniform, myCanvas.width, myCanvas.height);
    //trigger the rendering :
    GL.drawElements(GL.TRIANGLES, 6, GL.UNSIGNED_SHORT, 0);
    GL.flush();

} //end main()
