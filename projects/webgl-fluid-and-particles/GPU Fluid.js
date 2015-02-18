(function () { "use strict";
var $hxClasses = {},$estr = function() { return js.Boot.__string_rec(this,''); };
function $extend(from, fields) {
	function Inherit() {} Inherit.prototype = from; var proto = new Inherit();
	for (var name in fields) proto[name] = fields[name];
	if( fields.toString !== Object.prototype.toString ) proto.toString = fields.toString;
	return proto;
}
var EReg = function(r,opt) {
	opt = opt.split("u").join("");
	this.r = new RegExp(r,opt);
};
$hxClasses["EReg"] = EReg;
EReg.__name__ = true;
EReg.prototype = {
	replace: function(s,by) {
		return s.replace(this.r,by);
	}
	,__class__: EReg
};
var GPUFluid = function(width,height,cellSize,solverIterations) {
	if(solverIterations == null) solverIterations = 18;
	if(cellSize == null) cellSize = 8;
	this.pressureGradientSubstractShader = new PressureGradientSubstract();
	this.pressureSolveShader = new PressureSolve();
	this.divergenceShader = new Divergence();
	this.advectShader = new Advect();
	this.gl = snow.platform.web.render.opengl.GL;
	this.width = width;
	this.height = height;
	this.solverIterations = solverIterations;
	this.aspectRatio = this.width / this.height;
	this.cellSize = cellSize;
	this.advectShader.rdx.set(1 / this.cellSize);
	this.divergenceShader.halfrdx.set(0.5 * (1 / this.cellSize));
	this.pressureGradientSubstractShader.halfrdx.set(0.5 * (1 / this.cellSize));
	this.pressureSolveShader.alpha.set(-this.cellSize * this.cellSize);
	this.cellSize;
	var texture_float_linear_supported = true;
	if(this.gl.getExtension("OES_texture_float_linear") == null) texture_float_linear_supported = false;
	if(this.gl.getExtension("OES_texture_float") == null) null;
	this.textureQuad = gltoolbox.GeometryTools.getCachedTextureQuad();
	var nearestFactory = gltoolbox.TextureTools.createTextureFactory(6408,5126,9728,null);
	this.velocityRenderTarget = new gltoolbox.render.RenderTarget2Phase(width,height,gltoolbox.TextureTools.createTextureFactory(6408,5126,9729,null));
	this.pressureRenderTarget = new gltoolbox.render.RenderTarget2Phase(width,height,nearestFactory);
	this.divergenceRenderTarget = new gltoolbox.render.RenderTarget(width,height,nearestFactory);
	this.dyeRenderTarget = new gltoolbox.render.RenderTarget2Phase(width,height,gltoolbox.TextureTools.createTextureFactory(6408,5126,texture_float_linear_supported?9729:9728,null));
	this.updateCoreShaderUniforms(this.advectShader);
	this.updateCoreShaderUniforms(this.divergenceShader);
	this.updateCoreShaderUniforms(this.pressureSolveShader);
	this.updateCoreShaderUniforms(this.pressureGradientSubstractShader);
};
$hxClasses["GPUFluid"] = GPUFluid;
GPUFluid.__name__ = true;
GPUFluid.prototype = {
	step: function(dt) {
		this.gl.viewport(0,0,this.width,this.height);
		this.gl.bindBuffer(34962,this.textureQuad);
		this.advect(this.velocityRenderTarget,dt);
		if(this.applyForcesShader == null) null; else {
			this.applyForcesShader.dt.set(dt);
			this.applyForcesShader.velocity.set(this.velocityRenderTarget.readFromTexture);
			this.renderShaderTo(this.applyForcesShader,this.velocityRenderTarget);
			this.velocityRenderTarget.swap();
		}
		this.divergenceShader.velocity.set(this.velocityRenderTarget.readFromTexture);
		this.renderShaderTo(this.divergenceShader,this.divergenceRenderTarget);
		this.solvePressure();
		this.pressureGradientSubstractShader.pressure.set(this.pressureRenderTarget.readFromTexture);
		this.pressureGradientSubstractShader.velocity.set(this.velocityRenderTarget.readFromTexture);
		this.renderShaderTo(this.pressureGradientSubstractShader,this.velocityRenderTarget);
		this.velocityRenderTarget.swap();
		if(this.updateDyeShader == null) null; else {
			this.updateDyeShader.dt.set(dt);
			this.updateDyeShader.dye.set(this.dyeRenderTarget.readFromTexture);
			this.renderShaderTo(this.updateDyeShader,this.dyeRenderTarget);
			this.dyeRenderTarget.swap();
		}
		this.advect(this.dyeRenderTarget,dt);
	}
	,resize: function(width,height) {
		this.velocityRenderTarget.resize(width,height);
		this.pressureRenderTarget.resize(width,height);
		this.divergenceRenderTarget.resize(width,height);
		this.dyeRenderTarget.resize(width,height);
		this.width = width;
		this.height = height;
	}
	,clear: function() {
		this.velocityRenderTarget.clear(16384);
		this.pressureRenderTarget.clear(16384);
		this.dyeRenderTarget.clear(16384);
	}
	,simToClipSpaceX: function(simX) {
		return simX / (this.cellSize * this.aspectRatio);
	}
	,simToClipSpaceY: function(simY) {
		return simY / this.cellSize;
	}
	,advect: function(target,dt) {
		this.advectShader.dt.set(dt);
		this.advectShader.target.set(target.readFromTexture);
		this.advectShader.velocity.set(this.velocityRenderTarget.readFromTexture);
		this.renderShaderTo(this.advectShader,target);
		target.tmpFBO = target.writeFrameBufferObject;
		target.writeFrameBufferObject = target.readFrameBufferObject;
		target.readFrameBufferObject = target.tmpFBO;
		target.tmpTex = target.writeToTexture;
		target.writeToTexture = target.readFromTexture;
		target.readFromTexture = target.tmpTex;
	}
	,applyForces: function(dt) {
		if(this.applyForcesShader == null) return;
		this.applyForcesShader.dt.set(dt);
		this.applyForcesShader.velocity.set(this.velocityRenderTarget.readFromTexture);
		this.renderShaderTo(this.applyForcesShader,this.velocityRenderTarget);
		this.velocityRenderTarget.swap();
	}
	,computeDivergence: function() {
		this.divergenceShader.velocity.set(this.velocityRenderTarget.readFromTexture);
		this.renderShaderTo(this.divergenceShader,this.divergenceRenderTarget);
	}
	,solvePressure: function() {
		this.pressureSolveShader.divergence.set(this.divergenceRenderTarget.texture);
		this.pressureSolveShader.activate(true,true);
		var _g1 = 0;
		var _g = this.solverIterations;
		while(_g1 < _g) {
			var i = _g1++;
			this.pressureSolveShader.pressure.set(this.pressureRenderTarget.readFromTexture);
			this.pressureSolveShader.setUniforms();
			snow.platform.web.render.opengl.GL.bindFramebuffer(36160,this.pressureRenderTarget.writeFrameBufferObject);
			this.gl.drawArrays(5,0,4);
			this.pressureRenderTarget.swap();
		}
		this.pressureSolveShader.deactivate();
	}
	,subtractPressureGradient: function() {
		this.pressureGradientSubstractShader.pressure.set(this.pressureRenderTarget.readFromTexture);
		this.pressureGradientSubstractShader.velocity.set(this.velocityRenderTarget.readFromTexture);
		this.renderShaderTo(this.pressureGradientSubstractShader,this.velocityRenderTarget);
		this.velocityRenderTarget.swap();
	}
	,updateDye: function(dt) {
		if(this.updateDyeShader == null) return;
		this.updateDyeShader.dt.set(dt);
		this.updateDyeShader.dye.set(this.dyeRenderTarget.readFromTexture);
		this.renderShaderTo(this.updateDyeShader,this.dyeRenderTarget);
		this.dyeRenderTarget.swap();
	}
	,renderShaderTo: function(shader,target) {
		if(shader.active) {
			shader.setUniforms();
			shader.setAttributes();
			null;
		} else {
			if(!shader.ready) shader.create();
			snow.platform.web.render.opengl.GL.useProgram(shader.prog);
			shader.setUniforms();
			shader.setAttributes();
			shader.active = true;
		}
		target.activate();
		this.gl.drawArrays(5,0,4);
		shader.deactivate();
	}
	,updateCoreShaderUniforms: function(shader) {
		if(shader == null) return;
		shader.aspectRatio.set(this.aspectRatio);
		shader.invresolution.data.x = 1 / this.width;
		shader.invresolution.data.y = 1 / this.height;
	}
	,set_applyForcesShader: function(v) {
		this.applyForcesShader = v;
		this.applyForcesShader.dx.set_data(this.cellSize);
		this.updateCoreShaderUniforms(this.applyForcesShader);
		return this.applyForcesShader;
	}
	,set_updateDyeShader: function(v) {
		this.updateDyeShader = v;
		this.updateDyeShader.dx.set_data(this.cellSize);
		this.updateCoreShaderUniforms(this.updateDyeShader);
		return this.updateDyeShader;
	}
	,set_cellSize: function(v) {
		this.cellSize = v;
		this.advectShader.rdx.set(1 / this.cellSize);
		this.divergenceShader.halfrdx.set(0.5 * (1 / this.cellSize));
		this.pressureGradientSubstractShader.halfrdx.set(0.5 * (1 / this.cellSize));
		this.pressureSolveShader.alpha.set(-this.cellSize * this.cellSize);
		return this.cellSize;
	}
	,__class__: GPUFluid
};
var shaderblox = {};
shaderblox.ShaderBase = function() {
	this.textures = [];
	this.uniforms = [];
	this.attributes = [];
	this.name = ("" + Std.string(Type.getClass(this))).split(".").pop();
	this.createProperties();
};
$hxClasses["shaderblox.ShaderBase"] = shaderblox.ShaderBase;
shaderblox.ShaderBase.__name__ = true;
shaderblox.ShaderBase.prototype = {
	createProperties: function() {
	}
	,create: function() {
	}
	,destroy: function() {
		haxe.Log.trace("Destroying " + Std.string(this),{ fileName : "ShaderBase.hx", lineNumber : 51, className : "shaderblox.ShaderBase", methodName : "destroy"});
		snow.platform.web.render.opengl.GL.deleteShader(this.vert);
		snow.platform.web.render.opengl.GL.deleteShader(this.frag);
		snow.platform.web.render.opengl.GL.deleteProgram(this.prog);
		this.prog = null;
		this.vert = null;
		this.frag = null;
		this.ready = false;
	}
	,initFromSource: function(vertSource,fragSource) {
		var vertexShader = snow.platform.web.render.opengl.GL.createShader(35633);
		snow.platform.web.render.opengl.GL.shaderSource(vertexShader,vertSource);
		snow.platform.web.render.opengl.GL.compileShader(vertexShader);
		if(snow.platform.web.render.opengl.GL.getShaderParameter(vertexShader,35713) == 0) {
			haxe.Log.trace("Error compiling vertex shader: " + snow.platform.web.render.opengl.GL.getShaderInfoLog(vertexShader),{ fileName : "ShaderBase.hx", lineNumber : 67, className : "shaderblox.ShaderBase", methodName : "initFromSource"});
			haxe.Log.trace("\n" + vertSource,{ fileName : "ShaderBase.hx", lineNumber : 68, className : "shaderblox.ShaderBase", methodName : "initFromSource"});
			throw "Error compiling vertex shader";
		}
		var fragmentShader = snow.platform.web.render.opengl.GL.createShader(35632);
		snow.platform.web.render.opengl.GL.shaderSource(fragmentShader,fragSource);
		snow.platform.web.render.opengl.GL.compileShader(fragmentShader);
		if(snow.platform.web.render.opengl.GL.getShaderParameter(fragmentShader,35713) == 0) {
			haxe.Log.trace("Error compiling fragment shader: " + snow.platform.web.render.opengl.GL.getShaderInfoLog(fragmentShader) + "\n",{ fileName : "ShaderBase.hx", lineNumber : 77, className : "shaderblox.ShaderBase", methodName : "initFromSource"});
			var lines = fragSource.split("\n");
			var i = 0;
			var _g = 0;
			while(_g < lines.length) {
				var l = lines[_g];
				++_g;
				haxe.Log.trace(i++ + " - " + l,{ fileName : "ShaderBase.hx", lineNumber : 81, className : "shaderblox.ShaderBase", methodName : "initFromSource"});
			}
			throw "Error compiling fragment shader";
		}
		var shaderProgram = snow.platform.web.render.opengl.GL.createProgram();
		snow.platform.web.render.opengl.GL.attachShader(shaderProgram,vertexShader);
		snow.platform.web.render.opengl.GL.attachShader(shaderProgram,fragmentShader);
		snow.platform.web.render.opengl.GL.linkProgram(shaderProgram);
		if(snow.platform.web.render.opengl.GL.getProgramParameter(shaderProgram,35714) == 0) throw "Unable to initialize the shader program.\n" + snow.platform.web.render.opengl.GL.getProgramInfoLog(shaderProgram);
		var numUniforms = snow.platform.web.render.opengl.GL.getProgramParameter(shaderProgram,35718);
		var uniformLocations = new haxe.ds.StringMap();
		while(numUniforms-- > 0) {
			var uInfo = snow.platform.web.render.opengl.GL.getActiveUniform(shaderProgram,numUniforms);
			var loc = snow.platform.web.render.opengl.GL.getUniformLocation(shaderProgram,uInfo.name);
			uniformLocations.set(uInfo.name,loc);
			loc;
		}
		var numAttributes = snow.platform.web.render.opengl.GL.getProgramParameter(shaderProgram,35721);
		var attributeLocations = new haxe.ds.StringMap();
		while(numAttributes-- > 0) {
			var aInfo = snow.platform.web.render.opengl.GL.getActiveAttrib(shaderProgram,numAttributes);
			var loc1 = snow.platform.web.render.opengl.GL.getAttribLocation(shaderProgram,aInfo.name);
			attributeLocations.set(aInfo.name,loc1);
			loc1;
		}
		this.vert = vertexShader;
		this.frag = fragmentShader;
		this.prog = shaderProgram;
		var count = this.uniforms.length;
		var removeList = [];
		this.numTextures = 0;
		this.textures = [];
		var _g1 = 0;
		var _g11 = this.uniforms;
		while(_g1 < _g11.length) {
			var u = _g11[_g1];
			++_g1;
			var loc2 = uniformLocations.get(u.name);
			if(js.Boot.__instanceof(u,shaderblox.uniforms.UTexture)) {
				var t = u;
				t.samplerIndex = this.numTextures++;
				this.textures[t.samplerIndex] = t;
			}
			if(loc2 != null) u.location = loc2; else removeList.push(u);
		}
		while(removeList.length > 0) {
			var x = removeList.pop();
			HxOverrides.remove(this.uniforms,x);
		}
		var _g2 = 0;
		var _g12 = this.attributes;
		while(_g2 < _g12.length) {
			var a = _g12[_g2];
			++_g2;
			var loc3 = attributeLocations.get(a.name);
			if(loc3 == null) a.location = -1; else a.location = loc3;
		}
	}
	,activate: function(initUniforms,initAttribs) {
		if(initAttribs == null) initAttribs = false;
		if(initUniforms == null) initUniforms = true;
		if(this.active) {
			if(initUniforms) this.setUniforms();
			if(initAttribs) this.setAttributes();
			return;
		}
		if(!this.ready) this.create();
		snow.platform.web.render.opengl.GL.useProgram(this.prog);
		if(initUniforms) this.setUniforms();
		if(initAttribs) this.setAttributes();
		this.active = true;
	}
	,deactivate: function() {
		if(!this.active) return;
		this.active = false;
		this.disableAttributes();
	}
	,setUniforms: function() {
		var _g = 0;
		var _g1 = this.uniforms;
		while(_g < _g1.length) {
			var u = _g1[_g];
			++_g;
			u.apply();
		}
	}
	,setAttributes: function() {
		var offset = 0;
		var _g1 = 0;
		var _g = this.attributes.length;
		while(_g1 < _g) {
			var i = _g1++;
			var att = this.attributes[i];
			var location = att.location;
			if(location != -1) {
				snow.platform.web.render.opengl.GL.enableVertexAttribArray(location);
				snow.platform.web.render.opengl.GL.vertexAttribPointer(location,att.itemCount,att.type,false,this.aStride,offset);
			}
			offset += att.byteSize;
		}
	}
	,disableAttributes: function() {
		var _g1 = 0;
		var _g = this.attributes.length;
		while(_g1 < _g) {
			var i = _g1++;
			var idx = this.attributes[i].location;
			if(idx == -1) continue;
			snow.platform.web.render.opengl.GL.disableVertexAttribArray(idx);
		}
	}
	,toString: function() {
		return "[Shader(" + this.name + ", attributes:" + this.attributes.length + ", uniforms:" + this.uniforms.length + ")]";
	}
	,__class__: shaderblox.ShaderBase
};
var FluidBase = function() {
	shaderblox.ShaderBase.call(this);
};
$hxClasses["FluidBase"] = FluidBase;
FluidBase.__name__ = true;
FluidBase.__super__ = shaderblox.ShaderBase;
FluidBase.prototype = $extend(shaderblox.ShaderBase.prototype,{
	create: function() {
		this.initFromSource("\n#ifdef GL_ES\nprecision mediump float;\n#endif\n\n \r\nattribute vec2 vertexPosition;\r\n\r\nuniform float aspectRatio;\r\n\r\nvarying vec2 texelCoord;\r\n\r\n\r\nvarying vec2 p;\r\n\r\nvoid main() {\r\n\ttexelCoord = vertexPosition;\r\n\t\r\n\tvec2 clipSpace = 2.0*texelCoord - 1.0;\t\n\t\r\n\tp = vec2(clipSpace.x * aspectRatio, clipSpace.y);\r\n\r\n\tgl_Position = vec4(clipSpace, 0.0, 1.0 );\t\r\n}\r\n\n","\n#ifdef GL_ES\nprecision mediump float;\n#endif\n\n#define PRESSURE_BOUNDARY\n#define VELOCITY_BOUNDARY\n\nuniform vec2 invresolution;\nuniform float aspectRatio;\n\nvec2 clipToSimSpace(vec2 clipSpace){\n    return  vec2(clipSpace.x * aspectRatio, clipSpace.y);\n}\n\nvec2 simToTexelSpace(vec2 simSpace){\n    return vec2(simSpace.x / aspectRatio + 1.0 , simSpace.y + 1.0)*.5;\n}\n\n\nfloat samplePressue(sampler2D pressure, vec2 coord){\n    vec2 cellOffset = vec2(0.0, 0.0);\n\n    \n    \n    \n    #ifdef PRESSURE_BOUNDARY\n    if(coord.x < 0.0)      cellOffset.x = 1.0;\n    else if(coord.x > 1.0) cellOffset.x = -1.0;\n    if(coord.y < 0.0)      cellOffset.y = 1.0;\n    else if(coord.y > 1.0) cellOffset.y = -1.0;\n    #endif\n\n    return texture2D(pressure, coord + cellOffset * invresolution).x;\n}\n\n\nvec2 sampleVelocity(sampler2D velocity, vec2 coord){\n    vec2 cellOffset = vec2(0.0, 0.0);\n    vec2 multiplier = vec2(1.0, 1.0);\n\n    \n    \n    \n    #ifdef VELOCITY_BOUNDARY\n    if(coord.x<0.0){\n        cellOffset.x = 1.0;\n        multiplier.x = -1.0;\n    }else if(coord.x>1.0){\n        cellOffset.x = -1.0;\n        multiplier.x = -1.0;\n    }\n    if(coord.y<0.0){\n        cellOffset.y = 1.0;\n        multiplier.y = -1.0;\n    }else if(coord.y>1.0){\n        cellOffset.y = -1.0;\n        multiplier.y = -1.0;\n    }\n    #endif\n\n    return multiplier * texture2D(velocity, coord + cellOffset * invresolution).xy;\n}\n");
		this.ready = true;
	}
	,createProperties: function() {
		shaderblox.ShaderBase.prototype.createProperties.call(this);
		var instance = Type.createInstance(Type.resolveClass("shaderblox.uniforms.UFloat"),["aspectRatio",-1]);
		this.aspectRatio = instance;
		this.uniforms.push(instance);
		var instance1 = Type.createInstance(Type.resolveClass("shaderblox.uniforms.UVec2"),["invresolution",-1]);
		this.invresolution = instance1;
		this.uniforms.push(instance1);
		var instance2 = Type.createInstance(Type.resolveClass("shaderblox.attributes.FloatAttribute"),["vertexPosition",0,2]);
		this.vertexPosition = instance2;
		this.attributes.push(instance2);
		this.aStride += 8;
	}
	,__class__: FluidBase
});
var Advect = function() {
	FluidBase.call(this);
};
$hxClasses["Advect"] = Advect;
Advect.__name__ = true;
Advect.__super__ = FluidBase;
Advect.prototype = $extend(FluidBase.prototype,{
	create: function() {
		this.initFromSource("\n#ifdef GL_ES\nprecision mediump float;\n#endif\n\n \r\nattribute vec2 vertexPosition;\r\n\r\nuniform float aspectRatio;\r\n\r\nvarying vec2 texelCoord;\r\n\r\n\r\nvarying vec2 p;\r\n\r\nvoid main() {\r\n\ttexelCoord = vertexPosition;\r\n\t\r\n\tvec2 clipSpace = 2.0*texelCoord - 1.0;\t\n\t\r\n\tp = vec2(clipSpace.x * aspectRatio, clipSpace.y);\r\n\r\n\tgl_Position = vec4(clipSpace, 0.0, 1.0 );\t\r\n}\r\n\n\n\n","\n#ifdef GL_ES\nprecision mediump float;\n#endif\n\n#define PRESSURE_BOUNDARY\n#define VELOCITY_BOUNDARY\n\nuniform vec2 invresolution;\nuniform float aspectRatio;\n\nvec2 clipToSimSpace(vec2 clipSpace){\n    return  vec2(clipSpace.x * aspectRatio, clipSpace.y);\n}\n\nvec2 simToTexelSpace(vec2 simSpace){\n    return vec2(simSpace.x / aspectRatio + 1.0 , simSpace.y + 1.0)*.5;\n}\n\n\nfloat samplePressue(sampler2D pressure, vec2 coord){\n    vec2 cellOffset = vec2(0.0, 0.0);\n\n    \n    \n    \n    #ifdef PRESSURE_BOUNDARY\n    if(coord.x < 0.0)      cellOffset.x = 1.0;\n    else if(coord.x > 1.0) cellOffset.x = -1.0;\n    if(coord.y < 0.0)      cellOffset.y = 1.0;\n    else if(coord.y > 1.0) cellOffset.y = -1.0;\n    #endif\n\n    return texture2D(pressure, coord + cellOffset * invresolution).x;\n}\n\n\nvec2 sampleVelocity(sampler2D velocity, vec2 coord){\n    vec2 cellOffset = vec2(0.0, 0.0);\n    vec2 multiplier = vec2(1.0, 1.0);\n\n    \n    \n    \n    #ifdef VELOCITY_BOUNDARY\n    if(coord.x<0.0){\n        cellOffset.x = 1.0;\n        multiplier.x = -1.0;\n    }else if(coord.x>1.0){\n        cellOffset.x = -1.0;\n        multiplier.x = -1.0;\n    }\n    if(coord.y<0.0){\n        cellOffset.y = 1.0;\n        multiplier.y = -1.0;\n    }else if(coord.y>1.0){\n        cellOffset.y = -1.0;\n        multiplier.y = -1.0;\n    }\n    #endif\n\n    return multiplier * texture2D(velocity, coord + cellOffset * invresolution).xy;\n}\n\nuniform sampler2D velocity;\nuniform sampler2D target;\nuniform float dt;\nuniform float rdx; \n\nvarying vec2 texelCoord;\nvarying vec2 p;\n\nvoid main(void){\n  \n  \n  vec2 tracedPos = p - dt * rdx * texture2D(velocity, texelCoord ).xy;\n\n  \n  tracedPos = simToTexelSpace(tracedPos)/invresolution; \n  \n  vec4 st;\n  st.xy = floor(tracedPos-.5)+.5; \n  st.zw = st.xy+1.;               \n\n  vec2 t = tracedPos - st.xy;\n\n  st*=invresolution.xyxy; \n  \n  vec4 tex11 = texture2D(target, st.xy );\n  vec4 tex21 = texture2D(target, st.zy );\n  vec4 tex12 = texture2D(target, st.xw );\n  vec4 tex22 = texture2D(target, st.zw );\n\n  \n  gl_FragColor = mix(mix(tex11, tex21, t.x), mix(tex12, tex22, t.x), t.y);\n}\n");
		this.ready = true;
	}
	,createProperties: function() {
		FluidBase.prototype.createProperties.call(this);
		var instance = Type.createInstance(Type.resolveClass("shaderblox.uniforms.UTexture"),["velocity",-1,false]);
		this.velocity = instance;
		this.uniforms.push(instance);
		var instance1 = Type.createInstance(Type.resolveClass("shaderblox.uniforms.UTexture"),["target",-1,false]);
		this.target = instance1;
		this.uniforms.push(instance1);
		var instance2 = Type.createInstance(Type.resolveClass("shaderblox.uniforms.UFloat"),["dt",-1]);
		this.dt = instance2;
		this.uniforms.push(instance2);
		var instance3 = Type.createInstance(Type.resolveClass("shaderblox.uniforms.UFloat"),["rdx",-1]);
		this.rdx = instance3;
		this.uniforms.push(instance3);
		this.aStride += 0;
	}
	,__class__: Advect
});
var Divergence = function() {
	FluidBase.call(this);
};
$hxClasses["Divergence"] = Divergence;
Divergence.__name__ = true;
Divergence.__super__ = FluidBase;
Divergence.prototype = $extend(FluidBase.prototype,{
	create: function() {
		this.initFromSource("\n#ifdef GL_ES\nprecision mediump float;\n#endif\n\n \r\nattribute vec2 vertexPosition;\r\n\r\nuniform float aspectRatio;\r\n\r\nvarying vec2 texelCoord;\r\n\r\n\r\nvarying vec2 p;\r\n\r\nvoid main() {\r\n\ttexelCoord = vertexPosition;\r\n\t\r\n\tvec2 clipSpace = 2.0*texelCoord - 1.0;\t\n\t\r\n\tp = vec2(clipSpace.x * aspectRatio, clipSpace.y);\r\n\r\n\tgl_Position = vec4(clipSpace, 0.0, 1.0 );\t\r\n}\r\n\n\n\n","\n#ifdef GL_ES\nprecision mediump float;\n#endif\n\n#define PRESSURE_BOUNDARY\n#define VELOCITY_BOUNDARY\n\nuniform vec2 invresolution;\nuniform float aspectRatio;\n\nvec2 clipToSimSpace(vec2 clipSpace){\n    return  vec2(clipSpace.x * aspectRatio, clipSpace.y);\n}\n\nvec2 simToTexelSpace(vec2 simSpace){\n    return vec2(simSpace.x / aspectRatio + 1.0 , simSpace.y + 1.0)*.5;\n}\n\n\nfloat samplePressue(sampler2D pressure, vec2 coord){\n    vec2 cellOffset = vec2(0.0, 0.0);\n\n    \n    \n    \n    #ifdef PRESSURE_BOUNDARY\n    if(coord.x < 0.0)      cellOffset.x = 1.0;\n    else if(coord.x > 1.0) cellOffset.x = -1.0;\n    if(coord.y < 0.0)      cellOffset.y = 1.0;\n    else if(coord.y > 1.0) cellOffset.y = -1.0;\n    #endif\n\n    return texture2D(pressure, coord + cellOffset * invresolution).x;\n}\n\n\nvec2 sampleVelocity(sampler2D velocity, vec2 coord){\n    vec2 cellOffset = vec2(0.0, 0.0);\n    vec2 multiplier = vec2(1.0, 1.0);\n\n    \n    \n    \n    #ifdef VELOCITY_BOUNDARY\n    if(coord.x<0.0){\n        cellOffset.x = 1.0;\n        multiplier.x = -1.0;\n    }else if(coord.x>1.0){\n        cellOffset.x = -1.0;\n        multiplier.x = -1.0;\n    }\n    if(coord.y<0.0){\n        cellOffset.y = 1.0;\n        multiplier.y = -1.0;\n    }else if(coord.y>1.0){\n        cellOffset.y = -1.0;\n        multiplier.y = -1.0;\n    }\n    #endif\n\n    return multiplier * texture2D(velocity, coord + cellOffset * invresolution).xy;\n}\n\nuniform sampler2D velocity;\t\nuniform float halfrdx;\t\n\r\nvarying vec2 texelCoord;\r\n\r\n\r\nvoid main(void){\r\n\t\n \t\n\tvec2 L = sampleVelocity(velocity, texelCoord - vec2(invresolution.x, 0));\r\n\tvec2 R = sampleVelocity(velocity, texelCoord + vec2(invresolution.x, 0));\r\n\tvec2 B = sampleVelocity(velocity, texelCoord - vec2(0, invresolution.y));\r\n\tvec2 T = sampleVelocity(velocity, texelCoord + vec2(0, invresolution.y));\r\n\r\n\tgl_FragColor = vec4( halfrdx * ((R.x - L.x) + (T.y - B.y)), 0, 0, 1);\r\n}\r\n\n");
		this.ready = true;
	}
	,createProperties: function() {
		FluidBase.prototype.createProperties.call(this);
		var instance = Type.createInstance(Type.resolveClass("shaderblox.uniforms.UTexture"),["velocity",-1,false]);
		this.velocity = instance;
		this.uniforms.push(instance);
		var instance1 = Type.createInstance(Type.resolveClass("shaderblox.uniforms.UFloat"),["halfrdx",-1]);
		this.halfrdx = instance1;
		this.uniforms.push(instance1);
		this.aStride += 0;
	}
	,__class__: Divergence
});
var PressureSolve = function() {
	FluidBase.call(this);
};
$hxClasses["PressureSolve"] = PressureSolve;
PressureSolve.__name__ = true;
PressureSolve.__super__ = FluidBase;
PressureSolve.prototype = $extend(FluidBase.prototype,{
	create: function() {
		this.initFromSource("\n#ifdef GL_ES\nprecision mediump float;\n#endif\n\n \r\nattribute vec2 vertexPosition;\r\n\r\nuniform float aspectRatio;\r\n\r\nvarying vec2 texelCoord;\r\n\r\n\r\nvarying vec2 p;\r\n\r\nvoid main() {\r\n\ttexelCoord = vertexPosition;\r\n\t\r\n\tvec2 clipSpace = 2.0*texelCoord - 1.0;\t\n\t\r\n\tp = vec2(clipSpace.x * aspectRatio, clipSpace.y);\r\n\r\n\tgl_Position = vec4(clipSpace, 0.0, 1.0 );\t\r\n}\r\n\n\n\n","\n#ifdef GL_ES\nprecision mediump float;\n#endif\n\n#define PRESSURE_BOUNDARY\n#define VELOCITY_BOUNDARY\n\nuniform vec2 invresolution;\nuniform float aspectRatio;\n\nvec2 clipToSimSpace(vec2 clipSpace){\n    return  vec2(clipSpace.x * aspectRatio, clipSpace.y);\n}\n\nvec2 simToTexelSpace(vec2 simSpace){\n    return vec2(simSpace.x / aspectRatio + 1.0 , simSpace.y + 1.0)*.5;\n}\n\n\nfloat samplePressue(sampler2D pressure, vec2 coord){\n    vec2 cellOffset = vec2(0.0, 0.0);\n\n    \n    \n    \n    #ifdef PRESSURE_BOUNDARY\n    if(coord.x < 0.0)      cellOffset.x = 1.0;\n    else if(coord.x > 1.0) cellOffset.x = -1.0;\n    if(coord.y < 0.0)      cellOffset.y = 1.0;\n    else if(coord.y > 1.0) cellOffset.y = -1.0;\n    #endif\n\n    return texture2D(pressure, coord + cellOffset * invresolution).x;\n}\n\n\nvec2 sampleVelocity(sampler2D velocity, vec2 coord){\n    vec2 cellOffset = vec2(0.0, 0.0);\n    vec2 multiplier = vec2(1.0, 1.0);\n\n    \n    \n    \n    #ifdef VELOCITY_BOUNDARY\n    if(coord.x<0.0){\n        cellOffset.x = 1.0;\n        multiplier.x = -1.0;\n    }else if(coord.x>1.0){\n        cellOffset.x = -1.0;\n        multiplier.x = -1.0;\n    }\n    if(coord.y<0.0){\n        cellOffset.y = 1.0;\n        multiplier.y = -1.0;\n    }else if(coord.y>1.0){\n        cellOffset.y = -1.0;\n        multiplier.y = -1.0;\n    }\n    #endif\n\n    return multiplier * texture2D(velocity, coord + cellOffset * invresolution).xy;\n}\n\nuniform sampler2D pressure;\nuniform sampler2D divergence;\nuniform float alpha;\n\nvarying vec2 texelCoord;\n\nvoid main(void){\n  \n  \n  float L = samplePressue(pressure, texelCoord - vec2(invresolution.x, 0));\n  float R = samplePressue(pressure, texelCoord + vec2(invresolution.x, 0));\n  float B = samplePressue(pressure, texelCoord - vec2(0, invresolution.y));\n  float T = samplePressue(pressure, texelCoord + vec2(0, invresolution.y));\n\n  float bC = texture2D(divergence, texelCoord).x;\n\n  gl_FragColor = vec4( (L + R + B + T + alpha * bC) * .25, 0, 0, 1 );\n}\n");
		this.ready = true;
	}
	,createProperties: function() {
		FluidBase.prototype.createProperties.call(this);
		var instance = Type.createInstance(Type.resolveClass("shaderblox.uniforms.UTexture"),["pressure",-1,false]);
		this.pressure = instance;
		this.uniforms.push(instance);
		var instance1 = Type.createInstance(Type.resolveClass("shaderblox.uniforms.UTexture"),["divergence",-1,false]);
		this.divergence = instance1;
		this.uniforms.push(instance1);
		var instance2 = Type.createInstance(Type.resolveClass("shaderblox.uniforms.UFloat"),["alpha",-1]);
		this.alpha = instance2;
		this.uniforms.push(instance2);
		this.aStride += 0;
	}
	,__class__: PressureSolve
});
var PressureGradientSubstract = function() {
	FluidBase.call(this);
};
$hxClasses["PressureGradientSubstract"] = PressureGradientSubstract;
PressureGradientSubstract.__name__ = true;
PressureGradientSubstract.__super__ = FluidBase;
PressureGradientSubstract.prototype = $extend(FluidBase.prototype,{
	create: function() {
		this.initFromSource("\n#ifdef GL_ES\nprecision mediump float;\n#endif\n\n \r\nattribute vec2 vertexPosition;\r\n\r\nuniform float aspectRatio;\r\n\r\nvarying vec2 texelCoord;\r\n\r\n\r\nvarying vec2 p;\r\n\r\nvoid main() {\r\n\ttexelCoord = vertexPosition;\r\n\t\r\n\tvec2 clipSpace = 2.0*texelCoord - 1.0;\t\n\t\r\n\tp = vec2(clipSpace.x * aspectRatio, clipSpace.y);\r\n\r\n\tgl_Position = vec4(clipSpace, 0.0, 1.0 );\t\r\n}\r\n\n\n\n","\n#ifdef GL_ES\nprecision mediump float;\n#endif\n\n#define PRESSURE_BOUNDARY\n#define VELOCITY_BOUNDARY\n\nuniform vec2 invresolution;\nuniform float aspectRatio;\n\nvec2 clipToSimSpace(vec2 clipSpace){\n    return  vec2(clipSpace.x * aspectRatio, clipSpace.y);\n}\n\nvec2 simToTexelSpace(vec2 simSpace){\n    return vec2(simSpace.x / aspectRatio + 1.0 , simSpace.y + 1.0)*.5;\n}\n\n\nfloat samplePressue(sampler2D pressure, vec2 coord){\n    vec2 cellOffset = vec2(0.0, 0.0);\n\n    \n    \n    \n    #ifdef PRESSURE_BOUNDARY\n    if(coord.x < 0.0)      cellOffset.x = 1.0;\n    else if(coord.x > 1.0) cellOffset.x = -1.0;\n    if(coord.y < 0.0)      cellOffset.y = 1.0;\n    else if(coord.y > 1.0) cellOffset.y = -1.0;\n    #endif\n\n    return texture2D(pressure, coord + cellOffset * invresolution).x;\n}\n\n\nvec2 sampleVelocity(sampler2D velocity, vec2 coord){\n    vec2 cellOffset = vec2(0.0, 0.0);\n    vec2 multiplier = vec2(1.0, 1.0);\n\n    \n    \n    \n    #ifdef VELOCITY_BOUNDARY\n    if(coord.x<0.0){\n        cellOffset.x = 1.0;\n        multiplier.x = -1.0;\n    }else if(coord.x>1.0){\n        cellOffset.x = -1.0;\n        multiplier.x = -1.0;\n    }\n    if(coord.y<0.0){\n        cellOffset.y = 1.0;\n        multiplier.y = -1.0;\n    }else if(coord.y>1.0){\n        cellOffset.y = -1.0;\n        multiplier.y = -1.0;\n    }\n    #endif\n\n    return multiplier * texture2D(velocity, coord + cellOffset * invresolution).xy;\n}\n\nuniform sampler2D pressure;\r\nuniform sampler2D velocity;\r\nuniform float halfrdx;\r\n\r\nvarying vec2 texelCoord;\r\n\r\nvoid main(void){\r\n  float L = samplePressue(pressure, texelCoord - vec2(invresolution.x, 0));\r\n  float R = samplePressue(pressure, texelCoord + vec2(invresolution.x, 0));\r\n  float B = samplePressue(pressure, texelCoord - vec2(0, invresolution.y));\r\n  float T = samplePressue(pressure, texelCoord + vec2(0, invresolution.y));\r\n\r\n  vec2 v = texture2D(velocity, texelCoord).xy;\r\n\r\n  gl_FragColor = vec4(v - halfrdx*vec2(R-L, T-B), 0, 1);\r\n}\r\n\r\n\n");
		this.ready = true;
	}
	,createProperties: function() {
		FluidBase.prototype.createProperties.call(this);
		var instance = Type.createInstance(Type.resolveClass("shaderblox.uniforms.UTexture"),["pressure",-1,false]);
		this.pressure = instance;
		this.uniforms.push(instance);
		var instance1 = Type.createInstance(Type.resolveClass("shaderblox.uniforms.UTexture"),["velocity",-1,false]);
		this.velocity = instance1;
		this.uniforms.push(instance1);
		var instance2 = Type.createInstance(Type.resolveClass("shaderblox.uniforms.UFloat"),["halfrdx",-1]);
		this.halfrdx = instance2;
		this.uniforms.push(instance2);
		this.aStride += 0;
	}
	,__class__: PressureGradientSubstract
});
var ApplyForces = function() {
	FluidBase.call(this);
};
$hxClasses["ApplyForces"] = ApplyForces;
ApplyForces.__name__ = true;
ApplyForces.__super__ = FluidBase;
ApplyForces.prototype = $extend(FluidBase.prototype,{
	create: function() {
		this.initFromSource("\n#ifdef GL_ES\nprecision mediump float;\n#endif\n\n \r\nattribute vec2 vertexPosition;\r\n\r\nuniform float aspectRatio;\r\n\r\nvarying vec2 texelCoord;\r\n\r\n\r\nvarying vec2 p;\r\n\r\nvoid main() {\r\n\ttexelCoord = vertexPosition;\r\n\t\r\n\tvec2 clipSpace = 2.0*texelCoord - 1.0;\t\n\t\r\n\tp = vec2(clipSpace.x * aspectRatio, clipSpace.y);\r\n\r\n\tgl_Position = vec4(clipSpace, 0.0, 1.0 );\t\r\n}\r\n\n\n\n","\n#ifdef GL_ES\nprecision mediump float;\n#endif\n\n#define PRESSURE_BOUNDARY\n#define VELOCITY_BOUNDARY\n\nuniform vec2 invresolution;\nuniform float aspectRatio;\n\nvec2 clipToSimSpace(vec2 clipSpace){\n    return  vec2(clipSpace.x * aspectRatio, clipSpace.y);\n}\n\nvec2 simToTexelSpace(vec2 simSpace){\n    return vec2(simSpace.x / aspectRatio + 1.0 , simSpace.y + 1.0)*.5;\n}\n\n\nfloat samplePressue(sampler2D pressure, vec2 coord){\n    vec2 cellOffset = vec2(0.0, 0.0);\n\n    \n    \n    \n    #ifdef PRESSURE_BOUNDARY\n    if(coord.x < 0.0)      cellOffset.x = 1.0;\n    else if(coord.x > 1.0) cellOffset.x = -1.0;\n    if(coord.y < 0.0)      cellOffset.y = 1.0;\n    else if(coord.y > 1.0) cellOffset.y = -1.0;\n    #endif\n\n    return texture2D(pressure, coord + cellOffset * invresolution).x;\n}\n\n\nvec2 sampleVelocity(sampler2D velocity, vec2 coord){\n    vec2 cellOffset = vec2(0.0, 0.0);\n    vec2 multiplier = vec2(1.0, 1.0);\n\n    \n    \n    \n    #ifdef VELOCITY_BOUNDARY\n    if(coord.x<0.0){\n        cellOffset.x = 1.0;\n        multiplier.x = -1.0;\n    }else if(coord.x>1.0){\n        cellOffset.x = -1.0;\n        multiplier.x = -1.0;\n    }\n    if(coord.y<0.0){\n        cellOffset.y = 1.0;\n        multiplier.y = -1.0;\n    }else if(coord.y>1.0){\n        cellOffset.y = -1.0;\n        multiplier.y = -1.0;\n    }\n    #endif\n\n    return multiplier * texture2D(velocity, coord + cellOffset * invresolution).xy;\n}\n\nuniform sampler2D velocity;\n\tuniform float dt;\n\tuniform float dx;\n\tvarying vec2 texelCoord;\n\tvarying vec2 p;\n");
		this.ready = true;
	}
	,createProperties: function() {
		FluidBase.prototype.createProperties.call(this);
		var instance = Type.createInstance(Type.resolveClass("shaderblox.uniforms.UTexture"),["velocity",-1,false]);
		this.velocity = instance;
		this.uniforms.push(instance);
		var instance1 = Type.createInstance(Type.resolveClass("shaderblox.uniforms.UFloat"),["dt",-1]);
		this.dt = instance1;
		this.uniforms.push(instance1);
		var instance2 = Type.createInstance(Type.resolveClass("shaderblox.uniforms.UFloat"),["dx",-1]);
		this.dx = instance2;
		this.uniforms.push(instance2);
		this.aStride += 0;
	}
	,__class__: ApplyForces
});
var UpdateDye = function() {
	FluidBase.call(this);
};
$hxClasses["UpdateDye"] = UpdateDye;
UpdateDye.__name__ = true;
UpdateDye.__super__ = FluidBase;
UpdateDye.prototype = $extend(FluidBase.prototype,{
	create: function() {
		this.initFromSource("\n#ifdef GL_ES\nprecision mediump float;\n#endif\n\n \r\nattribute vec2 vertexPosition;\r\n\r\nuniform float aspectRatio;\r\n\r\nvarying vec2 texelCoord;\r\n\r\n\r\nvarying vec2 p;\r\n\r\nvoid main() {\r\n\ttexelCoord = vertexPosition;\r\n\t\r\n\tvec2 clipSpace = 2.0*texelCoord - 1.0;\t\n\t\r\n\tp = vec2(clipSpace.x * aspectRatio, clipSpace.y);\r\n\r\n\tgl_Position = vec4(clipSpace, 0.0, 1.0 );\t\r\n}\r\n\n\n\n","\n#ifdef GL_ES\nprecision mediump float;\n#endif\n\n#define PRESSURE_BOUNDARY\n#define VELOCITY_BOUNDARY\n\nuniform vec2 invresolution;\nuniform float aspectRatio;\n\nvec2 clipToSimSpace(vec2 clipSpace){\n    return  vec2(clipSpace.x * aspectRatio, clipSpace.y);\n}\n\nvec2 simToTexelSpace(vec2 simSpace){\n    return vec2(simSpace.x / aspectRatio + 1.0 , simSpace.y + 1.0)*.5;\n}\n\n\nfloat samplePressue(sampler2D pressure, vec2 coord){\n    vec2 cellOffset = vec2(0.0, 0.0);\n\n    \n    \n    \n    #ifdef PRESSURE_BOUNDARY\n    if(coord.x < 0.0)      cellOffset.x = 1.0;\n    else if(coord.x > 1.0) cellOffset.x = -1.0;\n    if(coord.y < 0.0)      cellOffset.y = 1.0;\n    else if(coord.y > 1.0) cellOffset.y = -1.0;\n    #endif\n\n    return texture2D(pressure, coord + cellOffset * invresolution).x;\n}\n\n\nvec2 sampleVelocity(sampler2D velocity, vec2 coord){\n    vec2 cellOffset = vec2(0.0, 0.0);\n    vec2 multiplier = vec2(1.0, 1.0);\n\n    \n    \n    \n    #ifdef VELOCITY_BOUNDARY\n    if(coord.x<0.0){\n        cellOffset.x = 1.0;\n        multiplier.x = -1.0;\n    }else if(coord.x>1.0){\n        cellOffset.x = -1.0;\n        multiplier.x = -1.0;\n    }\n    if(coord.y<0.0){\n        cellOffset.y = 1.0;\n        multiplier.y = -1.0;\n    }else if(coord.y>1.0){\n        cellOffset.y = -1.0;\n        multiplier.y = -1.0;\n    }\n    #endif\n\n    return multiplier * texture2D(velocity, coord + cellOffset * invresolution).xy;\n}\n\nuniform sampler2D dye;\n\tuniform float dt;\n\tuniform float dx;\n\tvarying vec2 texelCoord;\n\tvarying vec2 p;\n");
		this.ready = true;
	}
	,createProperties: function() {
		FluidBase.prototype.createProperties.call(this);
		var instance = Type.createInstance(Type.resolveClass("shaderblox.uniforms.UTexture"),["dye",-1,false]);
		this.dye = instance;
		this.uniforms.push(instance);
		var instance1 = Type.createInstance(Type.resolveClass("shaderblox.uniforms.UFloat"),["dt",-1]);
		this.dt = instance1;
		this.uniforms.push(instance1);
		var instance2 = Type.createInstance(Type.resolveClass("shaderblox.uniforms.UFloat"),["dx",-1]);
		this.dx = instance2;
		this.uniforms.push(instance2);
		this.aStride += 0;
	}
	,__class__: UpdateDye
});
var GPUParticles = function(count) {
	if(count == null) count = 524288;
	this.gl = snow.platform.web.render.opengl.GL;
	this.gl.getExtension("OES_texture_float");
	this.textureQuad = gltoolbox.GeometryTools.getCachedTextureQuad();
	this.inititalConditionsShader = new InitialConditions();
	this.stepParticlesShader = new StepParticles();
	this.stepParticlesShader.dragCoefficient.set_data(1);
	this.stepParticlesShader.flowScale.data.x = 1;
	this.stepParticlesShader.flowScale.data.y = 1;
	this.setCount(count);
	this.renderShaderTo(this.inititalConditionsShader,this.particleData);
};
$hxClasses["GPUParticles"] = GPUParticles;
GPUParticles.__name__ = true;
GPUParticles.prototype = {
	step: function(dt) {
		this.stepParticlesShader.dt.set_data(dt);
		this.stepParticlesShader.particleData.set_data(this.particleData.readFromTexture);
		this.renderShaderTo(this.stepParticlesShader,this.particleData);
	}
	,reset: function() {
		this.renderShaderTo(this.inititalConditionsShader,this.particleData);
	}
	,setCount: function(newCount) {
		var dataWidth = Math.ceil(Math.sqrt(newCount));
		var dataHeight = dataWidth;
		if(this.particleData != null) this.particleData.resize(dataWidth,dataHeight); else this.particleData = new gltoolbox.render.RenderTarget2Phase(dataWidth,dataHeight,gltoolbox.TextureTools.floatTextureFactoryRGBA);
		if(this.particleUVs != null) this.gl.deleteBuffer(this.particleUVs);
		this.particleUVs = this.gl.createBuffer();
		var arrayUVs = new Array();
		var _g = 0;
		while(_g < dataWidth) {
			var i = _g++;
			var _g1 = 0;
			while(_g1 < dataHeight) {
				var j = _g1++;
				arrayUVs.push(i / dataWidth);
				arrayUVs.push(j / dataHeight);
			}
		}
		this.gl.bindBuffer(34962,this.particleUVs);
		this.gl.bufferData(34962,new Float32Array(arrayUVs),35044);
		this.gl.bindBuffer(34962,null);
		return this.count = newCount;
	}
	,renderShaderTo: function(shader,target) {
		this.gl.viewport(0,0,target.width,target.height);
		this.gl.bindFramebuffer(36160,target.writeFrameBufferObject);
		this.gl.bindBuffer(34962,this.textureQuad);
		if(shader.active) {
			shader.setUniforms();
			shader.setAttributes();
			null;
		} else {
			if(!shader.ready) shader.create();
			snow.platform.web.render.opengl.GL.useProgram(shader.prog);
			shader.setUniforms();
			shader.setAttributes();
			shader.active = true;
		}
		this.gl.drawArrays(5,0,4);
		shader.deactivate();
		target.tmpFBO = target.writeFrameBufferObject;
		target.writeFrameBufferObject = target.readFrameBufferObject;
		target.readFrameBufferObject = target.tmpFBO;
		target.tmpTex = target.writeToTexture;
		target.writeToTexture = target.readFromTexture;
		target.readFromTexture = target.tmpTex;
	}
	,get_dragCoefficient: function() {
		return this.stepParticlesShader.dragCoefficient.data;
	}
	,get_flowScaleX: function() {
		return this.stepParticlesShader.flowScale.data.x;
	}
	,get_flowScaleY: function() {
		return this.stepParticlesShader.flowScale.data.y;
	}
	,get_flowVelocityField: function() {
		return this.stepParticlesShader.flowVelocityField.data;
	}
	,set_dragCoefficient: function(v) {
		return this.stepParticlesShader.dragCoefficient.set_data(v);
	}
	,set_flowScaleX: function(v) {
		return this.stepParticlesShader.flowScale.data.x = v;
	}
	,set_flowScaleY: function(v) {
		return this.stepParticlesShader.flowScale.data.y = v;
	}
	,set_flowVelocityField: function(v) {
		return this.stepParticlesShader.flowVelocityField.set_data(v);
	}
	,__class__: GPUParticles
};
var PlaneTexture = function() {
	shaderblox.ShaderBase.call(this);
};
$hxClasses["PlaneTexture"] = PlaneTexture;
PlaneTexture.__name__ = true;
PlaneTexture.__super__ = shaderblox.ShaderBase;
PlaneTexture.prototype = $extend(shaderblox.ShaderBase.prototype,{
	create: function() {
		this.initFromSource("\n#ifdef GL_ES\nprecision mediump float;\n#endif\n\nattribute vec2 vertexPosition;\n\tvarying vec2 texelCoord;\n\tvoid main(){\n\t\ttexelCoord = vertexPosition;\n\t\tgl_Position = vec4(vertexPosition*2.0 - vec2(1.0, 1.0), 0.0, 1.0 );\n\t}\n","\n#ifdef GL_ES\nprecision mediump float;\n#endif\n\nvarying vec2 texelCoord;\n");
		this.ready = true;
	}
	,createProperties: function() {
		shaderblox.ShaderBase.prototype.createProperties.call(this);
		var instance = Type.createInstance(Type.resolveClass("shaderblox.attributes.FloatAttribute"),["vertexPosition",0,2]);
		this.vertexPosition = instance;
		this.attributes.push(instance);
		this.aStride += 8;
	}
	,__class__: PlaneTexture
});
var InitialConditions = function() {
	PlaneTexture.call(this);
};
$hxClasses["InitialConditions"] = InitialConditions;
InitialConditions.__name__ = true;
InitialConditions.__super__ = PlaneTexture;
InitialConditions.prototype = $extend(PlaneTexture.prototype,{
	create: function() {
		this.initFromSource("\n#ifdef GL_ES\nprecision mediump float;\n#endif\n\nattribute vec2 vertexPosition;\n\tvarying vec2 texelCoord;\n\tvoid main(){\n\t\ttexelCoord = vertexPosition;\n\t\tgl_Position = vec4(vertexPosition*2.0 - vec2(1.0, 1.0), 0.0, 1.0 );\n\t}\n\n\n","\n#ifdef GL_ES\nprecision mediump float;\n#endif\n\nvarying vec2 texelCoord;\n\nvoid main(){\n\t\tvec2 ip = vec2((texelCoord.x), (texelCoord.y)) * 2.0 - 1.0;\n\t\tvec2 iv = vec2(0,0);\n\t\tgl_FragColor = vec4(ip, iv);\n\t}\n");
		this.ready = true;
	}
	,createProperties: function() {
		PlaneTexture.prototype.createProperties.call(this);
		this.aStride += 0;
	}
	,__class__: InitialConditions
});
var ParticleBase = function() {
	PlaneTexture.call(this);
};
$hxClasses["ParticleBase"] = ParticleBase;
ParticleBase.__name__ = true;
ParticleBase.__super__ = PlaneTexture;
ParticleBase.prototype = $extend(PlaneTexture.prototype,{
	create: function() {
		this.initFromSource("\n#ifdef GL_ES\nprecision mediump float;\n#endif\n\nattribute vec2 vertexPosition;\n\tvarying vec2 texelCoord;\n\tvoid main(){\n\t\ttexelCoord = vertexPosition;\n\t\tgl_Position = vec4(vertexPosition*2.0 - vec2(1.0, 1.0), 0.0, 1.0 );\n\t}\n\n\n","\n#ifdef GL_ES\nprecision mediump float;\n#endif\n\nvarying vec2 texelCoord;\n\nuniform float dt;\n\tuniform sampler2D particleData;\n");
		this.ready = true;
	}
	,createProperties: function() {
		PlaneTexture.prototype.createProperties.call(this);
		var instance = Type.createInstance(Type.resolveClass("shaderblox.uniforms.UFloat"),["dt",-1]);
		this.dt = instance;
		this.uniforms.push(instance);
		var instance1 = Type.createInstance(Type.resolveClass("shaderblox.uniforms.UTexture"),["particleData",-1,false]);
		this.particleData = instance1;
		this.uniforms.push(instance1);
		this.aStride += 0;
	}
	,__class__: ParticleBase
});
var StepParticles = function() {
	ParticleBase.call(this);
};
$hxClasses["StepParticles"] = StepParticles;
StepParticles.__name__ = true;
StepParticles.__super__ = ParticleBase;
StepParticles.prototype = $extend(ParticleBase.prototype,{
	create: function() {
		this.initFromSource("\n#ifdef GL_ES\nprecision mediump float;\n#endif\n\nattribute vec2 vertexPosition;\n\tvarying vec2 texelCoord;\n\tvoid main(){\n\t\ttexelCoord = vertexPosition;\n\t\tgl_Position = vec4(vertexPosition*2.0 - vec2(1.0, 1.0), 0.0, 1.0 );\n\t}\n\n\n\n\n","\n#ifdef GL_ES\nprecision mediump float;\n#endif\n\nvarying vec2 texelCoord;\n\nuniform float dt;\n\tuniform sampler2D particleData;\n\nuniform float dragCoefficient;\n\tuniform vec2 flowScale;\n\tuniform sampler2D flowVelocityField;\n\tvoid main(){\n\t\tvec2 p = texture2D(particleData, texelCoord).xy;\n\t\tvec2 v = texture2D(particleData, texelCoord).zw;\n\t\tvec2 vf = texture2D(flowVelocityField, (p+1.)*.5).xy * flowScale;\n\t\tv += (vf - v) * dragCoefficient;\n\t\tp+=dt*v;\n\t\tgl_FragColor = vec4(p, v);\n\t}\n");
		this.ready = true;
	}
	,createProperties: function() {
		ParticleBase.prototype.createProperties.call(this);
		var instance = Type.createInstance(Type.resolveClass("shaderblox.uniforms.UFloat"),["dragCoefficient",-1]);
		this.dragCoefficient = instance;
		this.uniforms.push(instance);
		var instance1 = Type.createInstance(Type.resolveClass("shaderblox.uniforms.UVec2"),["flowScale",-1]);
		this.flowScale = instance1;
		this.uniforms.push(instance1);
		var instance2 = Type.createInstance(Type.resolveClass("shaderblox.uniforms.UTexture"),["flowVelocityField",-1,false]);
		this.flowVelocityField = instance2;
		this.uniforms.push(instance2);
		this.aStride += 0;
	}
	,__class__: StepParticles
});
var RenderParticles = function() {
	shaderblox.ShaderBase.call(this);
};
$hxClasses["RenderParticles"] = RenderParticles;
RenderParticles.__name__ = true;
RenderParticles.__super__ = shaderblox.ShaderBase;
RenderParticles.prototype = $extend(shaderblox.ShaderBase.prototype,{
	create: function() {
		this.initFromSource("\n#ifdef GL_ES\nprecision mediump float;\n#endif\n\nuniform sampler2D particleData;\n\tattribute vec2 particleUV;\n\tvarying vec4 color;\n\t\n\tvoid main(){\n\t\tvec2 p = texture2D(particleData, particleUV).xy;\n\t\tvec2 v = texture2D(particleData, particleUV).zw;\n\t\tgl_PointSize = 1.0;\n\t\tgl_Position = vec4(p, 0.0, 1.0);\n\t\tcolor = vec4(1.0, 1.0, 1.0, 1.0);\n\t}\n","\n#ifdef GL_ES\nprecision mediump float;\n#endif\n\nvarying vec4 color;\n\tvoid main(){\n\t\tgl_FragColor = vec4(color);\n\t}\n");
		this.ready = true;
	}
	,createProperties: function() {
		shaderblox.ShaderBase.prototype.createProperties.call(this);
		var instance = Type.createInstance(Type.resolveClass("shaderblox.uniforms.UTexture"),["particleData",-1,false]);
		this.particleData = instance;
		this.uniforms.push(instance);
		var instance1 = Type.createInstance(Type.resolveClass("shaderblox.attributes.FloatAttribute"),["particleUV",0,2]);
		this.particleUV = instance1;
		this.attributes.push(instance1);
		this.aStride += 8;
	}
	,__class__: RenderParticles
});
var HxOverrides = function() { };
$hxClasses["HxOverrides"] = HxOverrides;
HxOverrides.__name__ = true;
HxOverrides.cca = function(s,index) {
	var x = s.charCodeAt(index);
	if(x != x) return undefined;
	return x;
};
HxOverrides.substr = function(s,pos,len) {
	if(pos != null && pos != 0 && len != null && len < 0) return "";
	if(len == null) len = s.length;
	if(pos < 0) {
		pos = s.length + pos;
		if(pos < 0) pos = 0;
	} else if(len < 0) len = s.length + len - pos;
	return s.substr(pos,len);
};
HxOverrides.indexOf = function(a,obj,i) {
	var len = a.length;
	if(i < 0) {
		i += len;
		if(i < 0) i = 0;
	}
	while(i < len) {
		if(a[i] === obj) return i;
		i++;
	}
	return -1;
};
HxOverrides.remove = function(a,obj) {
	var i = HxOverrides.indexOf(a,obj,0);
	if(i == -1) return false;
	a.splice(i,1);
	return true;
};
HxOverrides.iter = function(a) {
	return { cur : 0, arr : a, hasNext : function() {
		return this.cur < this.arr.length;
	}, next : function() {
		return this.arr[this.cur++];
	}};
};
var Lambda = function() { };
$hxClasses["Lambda"] = Lambda;
Lambda.__name__ = true;
Lambda.has = function(it,elt) {
	var $it0 = $iterator(it)();
	while( $it0.hasNext() ) {
		var x = $it0.next();
		if(x == elt) return true;
	}
	return false;
};
var List = function() {
	this.length = 0;
};
$hxClasses["List"] = List;
List.__name__ = true;
List.prototype = {
	add: function(item) {
		var x = [item];
		if(this.h == null) this.h = x; else this.q[1] = x;
		this.q = x;
		this.length++;
	}
	,iterator: function() {
		return { h : this.h, hasNext : function() {
			return this.h != null;
		}, next : function() {
			if(this.h == null) return null;
			var x = this.h[0];
			this.h = this.h[1];
			return x;
		}};
	}
	,__class__: List
};
var snow = {};
snow.App = function() {
	this.next_render = 0;
	this.next_tick = 0;
	this.alpha = 1.0;
	this.cur_frame_start = 0.0;
	this.current_time = 0;
	this.last_frame_start = 0.0;
	this.delta_sim = 0.0166666666666666664;
	this.delta_time = 0.0166666666666666664;
	this.max_frame_time = 0.25;
	this.update_rate = 0;
	this.render_rate = 0.0166666666666666664;
	this.fixed_delta = 0;
	this.timescale = 1;
};
$hxClasses["snow.App"] = snow.App;
snow.App.__name__ = true;
snow.App.prototype = {
	config: function(config) {
		return config;
	}
	,ready: function() {
	}
	,update: function(dt) {
	}
	,ondestroy: function() {
	}
	,onevent: function(event) {
	}
	,onkeydown: function(keycode,scancode,repeat,mod,timestamp,window_id) {
	}
	,onkeyup: function(keycode,scancode,repeat,mod,timestamp,window_id) {
	}
	,ontextinput: function(text,start,length,type,timestamp,window_id) {
	}
	,onmousedown: function(x,y,button,timestamp,window_id) {
	}
	,onmouseup: function(x,y,button,timestamp,window_id) {
	}
	,onmousewheel: function(x,y,timestamp,window_id) {
	}
	,onmousemove: function(x,y,xrel,yrel,timestamp,window_id) {
	}
	,ontouchdown: function(x,y,touch_id,timestamp) {
	}
	,ontouchup: function(x,y,touch_id,timestamp) {
	}
	,ontouchmove: function(x,y,dx,dy,touch_id,timestamp) {
	}
	,ongamepadaxis: function(gamepad,axis,value,timestamp) {
	}
	,ongamepaddown: function(gamepad,button,value,timestamp) {
	}
	,ongamepadup: function(gamepad,button,value,timestamp) {
	}
	,ongamepaddevice: function(gamepad,type,timestamp) {
	}
	,on_internal_init: function() {
		this.cur_frame_start = snow.Snow.core.timestamp();
		this.last_frame_start = this.cur_frame_start;
		this.current_time = 0;
		this.delta_time = 0.016;
	}
	,on_internal_update: function() {
		if(this.update_rate != 0) {
			if(this.next_tick < snow.Snow.core.timestamp()) this.next_tick = snow.Snow.core.timestamp() + this.update_rate; else return;
		}
		this.cur_frame_start = snow.Snow.core.timestamp();
		this.delta_time = this.cur_frame_start - this.last_frame_start;
		this.last_frame_start = this.cur_frame_start;
		var used_delta;
		if(this.fixed_delta == 0) used_delta = this.delta_time; else used_delta = this.fixed_delta;
		used_delta *= this.timescale;
		this.delta_sim = used_delta;
		this.current_time += used_delta;
		this.app.do_internal_update(used_delta);
		if(this.render_rate != 0) {
			if(this.next_render < snow.Snow.core.timestamp()) {
				this.app.render();
				this.next_render += this.render_rate;
			}
		}
	}
	,__class__: snow.App
};
var Main = function() {
	this.rshiftDown = false;
	this.lshiftDown = false;
	this.qualityDirection = 0;
	this.renderFluidEnabled = true;
	this.renderParticlesEnabled = true;
	this.lastMouseClipSpace = new shaderblox.uniforms.Vector2();
	this.lastMouse = new shaderblox.uniforms.Vector2();
	this.mouseClipSpace = new shaderblox.uniforms.Vector2();
	this.mouse = new shaderblox.uniforms.Vector2();
	this.lastMousePointKnown = false;
	this.mousePointKnown = false;
	this.isMouseDown = false;
	this.screenBuffer = null;
	this.textureQuad = null;
	this.gl = snow.platform.web.render.opengl.GL;
	snow.App.call(this);
	this.performanceMonitor = new PerformanceMonitor(35,null,2000);
	this.set_simulationQuality(SimulationQuality.High);
	this.performanceMonitor.fpsTooLowCallback = $bind(this,this.lowerQualityRequired);
	var urlParams = js.Web.getParams();
	if(urlParams.exists("q")) {
		var q = StringTools.trim(urlParams.get("q").toLowerCase());
		var _g = 0;
		var _g1 = Type.allEnums(SimulationQuality);
		while(_g < _g1.length) {
			var e = _g1[_g];
			++_g;
			var name = e[0].toLowerCase();
			if(q == name) {
				this.set_simulationQuality(e);
				this.performanceMonitor.fpsTooLowCallback = null;
				break;
			}
		}
	}
	if(urlParams.exists("iterations")) {
		var iterationsParam = Std.parseInt(urlParams.get("iterations"));
		if(((iterationsParam | 0) === iterationsParam)) this.set_fluidIterations(iterationsParam);
	}
};
$hxClasses["Main"] = Main;
Main.__name__ = true;
Main.__super__ = snow.App;
Main.prototype = $extend(snow.App.prototype,{
	config: function(config) {
		config.web.no_context_menu = false;
		config.window.borderless = true;
		config.window.fullscreen = true;
		return config;
	}
	,ready: function() {
		var _g1 = this;
		this.window = this.app.window;
		var windowInitialized = false;
		this.window.onevent = function(e) {
			haxe.Log.trace(e.type,{ fileName : "Main.hx", lineNumber : 117, className : "Main", methodName : "ready", customParams : [1]});
			var _g = e.type;
			switch(_g) {
			case 1:case 7:case 2:
				if(!windowInitialized) {
					_g1.init();
					_g1.window.onrender = $bind(_g1,_g1.render);
					windowInitialized = true;
				}
				break;
			default:
				null;
			}
		};
	}
	,init: function() {
		this.gl.disable(2929);
		this.gl.disable(2884);
		this.gl.disable(3024);
		this.textureQuad = gltoolbox.GeometryTools.createQuad(0,0,1,1);
		this.offScreenTarget = new gltoolbox.render.RenderTarget(Math.round(this.window.width * this.offScreenScale),Math.round(this.window.height * this.offScreenScale),gltoolbox.TextureTools.createTextureFactory(6407,5121,this.offScreenFilter,null));
		this.screenTextureShader = new ScreenTexture();
		this.renderParticlesShader = new ColorParticleMotion();
		this.updateDyeShader = new MouseDye();
		this.mouseForceShader = new MouseForce();
		this.updateDyeShader.mouseClipSpace.set_data(this.mouseClipSpace);
		this.updateDyeShader.lastMouseClipSpace.set_data(this.lastMouseClipSpace);
		this.mouseForceShader.mouseClipSpace.set_data(this.mouseClipSpace);
		this.mouseForceShader.lastMouseClipSpace.set_data(this.lastMouseClipSpace);
		var cellScale = 32;
		this.fluid = new GPUFluid(Math.round(this.window.width * this.fluidScale),Math.round(this.window.height * this.fluidScale),cellScale,this.fluidIterations);
		this.fluid.set_updateDyeShader(this.updateDyeShader);
		this.fluid.set_applyForcesShader(this.mouseForceShader);
		this.particles = new GPUParticles(this.particleCount);
		this.particles.set_flowScaleX(this.fluid.simToClipSpaceX(1));
		this.particles.set_flowScaleY(this.fluid.simToClipSpaceY(1));
		this.particles.stepParticlesShader.dragCoefficient.set_data(1);
		this.lastTime = haxe.Timer.stamp();
	}
	,render: function(w) {
		this.time = haxe.Timer.stamp();
		var dt = this.time - this.lastTime;
		this.lastTime = this.time;
		if(this.lastMousePointKnown) {
			this.updateDyeShader.isMouseDown.set(this.isMouseDown);
			this.mouseForceShader.isMouseDown.set(this.isMouseDown);
		}
		this.fluid.step(dt);
		this.particles.stepParticlesShader.flowVelocityField.set_data(this.fluid.velocityRenderTarget.readFromTexture);
		if(this.renderParticlesEnabled) this.particles.step(dt);
		this.gl.viewport(0,0,this.offScreenTarget.width,this.offScreenTarget.height);
		this.gl.bindFramebuffer(36160,this.offScreenTarget.frameBufferObject);
		this.gl.clearColor(0,0,0,1);
		this.gl.clear(16384);
		this.gl.enable(3042);
		this.gl.blendFunc(770,770);
		this.gl.blendEquation(32774);
		if(this.renderParticlesEnabled) {
			this.gl.bindBuffer(34962,this.particles.particleUVs);
			this.renderParticlesShader.particleData.set_data(this.particles.particleData.readFromTexture);
			this.renderParticlesShader.activate(true,true);
			this.gl.drawArrays(0,0,this.particles.count);
			this.renderParticlesShader.deactivate();
		}
		if(this.renderFluidEnabled) {
			this.gl.bindBuffer(34962,this.textureQuad);
			this.screenTextureShader.texture.set_data(this.fluid.dyeRenderTarget.readFromTexture);
			this.screenTextureShader.activate(true,true);
			this.gl.drawArrays(5,0,4);
			this.screenTextureShader.deactivate();
		}
		this.gl.disable(3042);
		this.gl.viewport(0,0,this.window.width,this.window.height);
		this.gl.bindFramebuffer(36160,this.screenBuffer);
		this.gl.bindBuffer(34962,this.textureQuad);
		this.screenTextureShader.texture.set_data(this.offScreenTarget.texture);
		this.screenTextureShader.activate(true,true);
		this.gl.drawArrays(5,0,4);
		this.screenTextureShader.deactivate();
		this.lastMouse.set(this.mouse.x,this.mouse.y);
		this.lastMouseClipSpace.set(this.mouse.x / this.window.width * 2 - 1,(this.window.height - this.mouse.y) / this.window.height * 2 - 1);
		this.lastMousePointKnown = this.mousePointKnown;
	}
	,renderTexture: function(texture) {
		this.gl.bindBuffer(34962,this.textureQuad);
		this.screenTextureShader.texture.set_data(texture);
		this.screenTextureShader.activate(true,true);
		this.gl.drawArrays(5,0,4);
		this.screenTextureShader.deactivate();
	}
	,renderParticles: function() {
		this.gl.bindBuffer(34962,this.particles.particleUVs);
		this.renderParticlesShader.particleData.set_data(this.particles.particleData.readFromTexture);
		this.renderParticlesShader.activate(true,true);
		this.gl.drawArrays(0,0,this.particles.count);
		this.renderParticlesShader.deactivate();
	}
	,updateSimulationTextures: function() {
		var w;
		var h;
		w = Math.round(this.window.width * this.fluidScale);
		h = Math.round(this.window.height * this.fluidScale);
		if(w != this.fluid.width || h != this.fluid.height) this.fluid.resize(w,h);
		w = Math.round(this.window.width * this.offScreenScale);
		h = Math.round(this.window.height * this.offScreenScale);
		if(w != this.offScreenTarget.width || h != this.offScreenTarget.height) this.offScreenTarget.resize(w,h);
		if(this.particleCount != this.particles.count) this.particles.setCount(this.particleCount);
	}
	,set_simulationQuality: function(quality) {
		switch(quality[1]) {
		case 0:
			this.particleCount = 1048576;
			this.fluidScale = 0.5;
			this.set_fluidIterations(30);
			this.offScreenScale = 1.;
			this.offScreenFilter = 9728;
			break;
		case 1:
			this.particleCount = 1048576;
			this.fluidScale = 0.25;
			this.set_fluidIterations(20);
			this.offScreenScale = 1.;
			this.offScreenFilter = 9728;
			break;
		case 2:
			this.particleCount = 262144;
			this.fluidScale = 0.25;
			this.set_fluidIterations(18);
			this.offScreenScale = 1.;
			this.offScreenFilter = 9728;
			break;
		case 3:
			this.particleCount = 65536;
			this.fluidScale = 0.2;
			this.set_fluidIterations(14);
			this.offScreenScale = 1.;
			this.offScreenFilter = 9728;
			break;
		case 4:
			this.particleCount = 16384;
			this.fluidScale = 0.166666666666666657;
			this.set_fluidIterations(12);
			this.offScreenScale = 0.5;
			this.offScreenFilter = 9728;
			break;
		case 5:
			this.particleCount = 65536;
			this.fluidScale = 0.1;
			this.set_fluidIterations(8);
			this.offScreenScale = 0.5;
			this.offScreenFilter = 9729;
			break;
		}
		return this.simulationQuality = quality;
	}
	,set_fluidIterations: function(v) {
		this.fluidIterations = v;
		if(this.fluid != null) this.fluid.solverIterations = v;
		return v;
	}
	,lowerQualityRequired: function(magnitude) {
		if(this.qualityDirection > 0) return;
		this.qualityDirection = -1;
		var qualityIndex = this.simulationQuality[1];
		var maxIndex = Type.allEnums(SimulationQuality).length - 1;
		if(qualityIndex >= maxIndex) return;
		if(magnitude < 0.5) qualityIndex += 1; else qualityIndex += 2;
		if(qualityIndex > maxIndex) qualityIndex = maxIndex;
		var newQuality = Type.createEnumIndex(SimulationQuality,qualityIndex);
		haxe.Log.trace("Average FPS: " + this.performanceMonitor.fpsSample.average + ", lowering quality to: " + Std.string(newQuality),{ fileName : "Main.hx", lineNumber : 387, className : "Main", methodName : "lowerQualityRequired"});
		this.set_simulationQuality(newQuality);
		this.updateSimulationTextures();
	}
	,higherQualityRequired: function(magnitude) {
		if(this.qualityDirection < 0) return;
		this.qualityDirection = 1;
		var qualityIndex = this.simulationQuality[1];
		var minIndex = 0;
		if(qualityIndex <= minIndex) return;
		if(magnitude < 0.5) qualityIndex -= 1; else qualityIndex -= 2;
		if(qualityIndex < minIndex) qualityIndex = minIndex;
		var newQuality = Type.createEnumIndex(SimulationQuality,qualityIndex);
		haxe.Log.trace("Raising quality to: " + Std.string(newQuality),{ fileName : "Main.hx", lineNumber : 407, className : "Main", methodName : "higherQualityRequired"});
		this.set_simulationQuality(newQuality);
		this.updateSimulationTextures();
	}
	,reset: function() {
		this.particles.reset();
		this.fluid.clear();
	}
	,windowToClipSpaceX: function(x) {
		return x / this.window.width * 2 - 1;
	}
	,windowToClipSpaceY: function(y) {
		return (this.window.height - y) / this.window.height * 2 - 1;
	}
	,onmousedown: function(x,y,button,_,_1) {
		this.isMouseDown = true;
	}
	,onmouseup: function(x,y,button,_,_1) {
		this.isMouseDown = false;
	}
	,onmousemove: function(x,y,xrel,yrel,_,_1) {
		this.mouse.set(x,y);
		this.mouseClipSpace.set(x / this.window.width * 2 - 1,(this.window.height - y) / this.window.height * 2 - 1);
		this.mousePointKnown = true;
	}
	,updateTouchCoordinate: function(x,y) {
		x = x * this.window.width;
		y = y * this.window.height;
		this.mouse.set(x,y);
		this.mouseClipSpace.set(x / this.window.width * 2 - 1,(this.window.height - y) / this.window.height * 2 - 1);
		this.mousePointKnown = true;
	}
	,ontouchdown: function(x,y,_,_1) {
		this.updateTouchCoordinate(x,y);
		this.lastMouse.set(this.mouse.x,this.mouse.y);
		this.lastMouseClipSpace.set(this.mouse.x / this.window.width * 2 - 1,(this.window.height - this.mouse.y) / this.window.height * 2 - 1);
		this.lastMousePointKnown = this.mousePointKnown;
		this.isMouseDown = true;
	}
	,ontouchup: function(x,y,_,_1) {
		this.updateTouchCoordinate(x,y);
		this.isMouseDown = false;
	}
	,ontouchmove: function(x,y,_,_1,_2,_3) {
		this.updateTouchCoordinate(x,y);
	}
	,updateLastMouse: function() {
		this.lastMouse.set(this.mouse.x,this.mouse.y);
		this.lastMouseClipSpace.set(this.mouse.x / this.window.width * 2 - 1,(this.window.height - this.mouse.y) / this.window.height * 2 - 1);
		this.lastMousePointKnown = this.mousePointKnown;
	}
	,onkeydown: function(keyCode,_,_1,_2,_3,_4) {
		switch(keyCode) {
		case snow.input.Keycodes.lshift:
			this.lshiftDown = true;
			break;
		case snow.input.Keycodes.rshift:
			this.rshiftDown = true;
			break;
		}
	}
	,onkeyup: function(keyCode,_,_1,_2,_3,_4) {
		switch(keyCode) {
		case snow.input.Keycodes.key_r:
			if(this.lshiftDown || this.rshiftDown) this.particles.reset(); else this.reset();
			break;
		case snow.input.Keycodes.key_p:
			this.renderParticlesEnabled = !this.renderParticlesEnabled;
			break;
		case snow.input.Keycodes.key_d:
			this.renderFluidEnabled = !this.renderFluidEnabled;
			break;
		case snow.input.Keycodes.key_s:
			this.fluid.clear();
			break;
		case snow.input.Keycodes.lshift:
			this.lshiftDown = false;
			break;
		case snow.input.Keycodes.rshift:
			this.rshiftDown = false;
			break;
		}
	}
	,__class__: Main
});
var SimulationQuality = { __ename__ : true, __constructs__ : ["UltraHigh","High","Medium","Low","UltraLow","iOS"] };
SimulationQuality.UltraHigh = ["UltraHigh",0];
SimulationQuality.UltraHigh.toString = $estr;
SimulationQuality.UltraHigh.__enum__ = SimulationQuality;
SimulationQuality.High = ["High",1];
SimulationQuality.High.toString = $estr;
SimulationQuality.High.__enum__ = SimulationQuality;
SimulationQuality.Medium = ["Medium",2];
SimulationQuality.Medium.toString = $estr;
SimulationQuality.Medium.__enum__ = SimulationQuality;
SimulationQuality.Low = ["Low",3];
SimulationQuality.Low.toString = $estr;
SimulationQuality.Low.__enum__ = SimulationQuality;
SimulationQuality.UltraLow = ["UltraLow",4];
SimulationQuality.UltraLow.toString = $estr;
SimulationQuality.UltraLow.__enum__ = SimulationQuality;
SimulationQuality.iOS = ["iOS",5];
SimulationQuality.iOS.toString = $estr;
SimulationQuality.iOS.__enum__ = SimulationQuality;
SimulationQuality.__empty_constructs__ = [SimulationQuality.UltraHigh,SimulationQuality.High,SimulationQuality.Medium,SimulationQuality.Low,SimulationQuality.UltraLow,SimulationQuality.iOS];
var ScreenTexture = function() {
	shaderblox.ShaderBase.call(this);
};
$hxClasses["ScreenTexture"] = ScreenTexture;
ScreenTexture.__name__ = true;
ScreenTexture.__super__ = shaderblox.ShaderBase;
ScreenTexture.prototype = $extend(shaderblox.ShaderBase.prototype,{
	create: function() {
		this.initFromSource("\n#ifdef GL_ES\nprecision mediump float;\n#endif\n\nattribute vec2 vertexPosition;\nvarying vec2 texelCoord;\n\nvoid main() {\n\ttexelCoord = vertexPosition;\n\tgl_Position = vec4(vertexPosition*2.0 - vec2(1.0, 1.0), 0.0, 1.0 );\n}\n","\n#ifdef GL_ES\nprecision mediump float;\n#endif\n\nuniform sampler2D texture;\nvarying vec2 texelCoord;\n\nvoid main(void){\n\tgl_FragColor = abs(texture2D(texture, texelCoord));\n}\n");
		this.ready = true;
	}
	,createProperties: function() {
		shaderblox.ShaderBase.prototype.createProperties.call(this);
		var instance = Type.createInstance(Type.resolveClass("shaderblox.uniforms.UTexture"),["texture",-1,false]);
		this.texture = instance;
		this.uniforms.push(instance);
		var instance1 = Type.createInstance(Type.resolveClass("shaderblox.attributes.FloatAttribute"),["vertexPosition",0,2]);
		this.vertexPosition = instance1;
		this.attributes.push(instance1);
		this.aStride += 8;
	}
	,__class__: ScreenTexture
});
var ColorParticleMotion = function() {
	RenderParticles.call(this);
};
$hxClasses["ColorParticleMotion"] = ColorParticleMotion;
ColorParticleMotion.__name__ = true;
ColorParticleMotion.__super__ = RenderParticles;
ColorParticleMotion.prototype = $extend(RenderParticles.prototype,{
	create: function() {
		this.initFromSource("\n#ifdef GL_ES\nprecision mediump float;\n#endif\n\nuniform sampler2D particleData;\n\tattribute vec2 particleUV;\n\tvarying vec4 color;\n\t\n\n\nvoid main(){\n\t\tvec2 p = texture2D(particleData, particleUV).xy;\n\t\tvec2 v = texture2D(particleData, particleUV).zw;\n\t\tgl_PointSize = 1.0;\n\t\tgl_Position = vec4(p, 0.0, 1.0);\n\t\tfloat speed = length(v);\n\t\tfloat x = clamp(speed * 1.0, 0., 1.);\n\t\tcolor.rgb = (\n\t\t\t\tmix(vec3(40.4, 0.0, 35.0) / 300.0, vec3(0.2, 47.8, 100) / 100.0, x)\n\t\t\t\t+ (vec3(63.1, 92.5, 100) / 100.) * x*x*x * .1\n\t\t);\n\t\tcolor.a = 1.0;\n\t}\n","\n#ifdef GL_ES\nprecision mediump float;\n#endif\n\nvarying vec4 color;\n\tvoid main(){\n\t\tgl_FragColor = vec4(color);\n\t}\n\n\n");
		this.ready = true;
	}
	,createProperties: function() {
		RenderParticles.prototype.createProperties.call(this);
		this.aStride += 0;
	}
	,__class__: ColorParticleMotion
});
var MouseDye = function() {
	UpdateDye.call(this);
};
$hxClasses["MouseDye"] = MouseDye;
MouseDye.__name__ = true;
MouseDye.__super__ = UpdateDye;
MouseDye.prototype = $extend(UpdateDye.prototype,{
	create: function() {
		this.initFromSource("\n#ifdef GL_ES\nprecision mediump float;\n#endif\n\n \r\nattribute vec2 vertexPosition;\r\n\r\nuniform float aspectRatio;\r\n\r\nvarying vec2 texelCoord;\r\n\r\n\r\nvarying vec2 p;\r\n\r\nvoid main() {\r\n\ttexelCoord = vertexPosition;\r\n\t\r\n\tvec2 clipSpace = 2.0*texelCoord - 1.0;\t\n\t\r\n\tp = vec2(clipSpace.x * aspectRatio, clipSpace.y);\r\n\r\n\tgl_Position = vec4(clipSpace, 0.0, 1.0 );\t\r\n}\r\n\n\n\n\n\n","\n#ifdef GL_ES\nprecision mediump float;\n#endif\n\n#define PRESSURE_BOUNDARY\n#define VELOCITY_BOUNDARY\n\nuniform vec2 invresolution;\nuniform float aspectRatio;\n\nvec2 clipToSimSpace(vec2 clipSpace){\n    return  vec2(clipSpace.x * aspectRatio, clipSpace.y);\n}\n\nvec2 simToTexelSpace(vec2 simSpace){\n    return vec2(simSpace.x / aspectRatio + 1.0 , simSpace.y + 1.0)*.5;\n}\n\n\nfloat samplePressue(sampler2D pressure, vec2 coord){\n    vec2 cellOffset = vec2(0.0, 0.0);\n\n    \n    \n    \n    #ifdef PRESSURE_BOUNDARY\n    if(coord.x < 0.0)      cellOffset.x = 1.0;\n    else if(coord.x > 1.0) cellOffset.x = -1.0;\n    if(coord.y < 0.0)      cellOffset.y = 1.0;\n    else if(coord.y > 1.0) cellOffset.y = -1.0;\n    #endif\n\n    return texture2D(pressure, coord + cellOffset * invresolution).x;\n}\n\n\nvec2 sampleVelocity(sampler2D velocity, vec2 coord){\n    vec2 cellOffset = vec2(0.0, 0.0);\n    vec2 multiplier = vec2(1.0, 1.0);\n\n    \n    \n    \n    #ifdef VELOCITY_BOUNDARY\n    if(coord.x<0.0){\n        cellOffset.x = 1.0;\n        multiplier.x = -1.0;\n    }else if(coord.x>1.0){\n        cellOffset.x = -1.0;\n        multiplier.x = -1.0;\n    }\n    if(coord.y<0.0){\n        cellOffset.y = 1.0;\n        multiplier.y = -1.0;\n    }else if(coord.y>1.0){\n        cellOffset.y = -1.0;\n        multiplier.y = -1.0;\n    }\n    #endif\n\n    return multiplier * texture2D(velocity, coord + cellOffset * invresolution).xy;\n}\n\nuniform sampler2D dye;\n\tuniform float dt;\n\tuniform float dx;\n\tvarying vec2 texelCoord;\n\tvarying vec2 p;\n\n\nfloat distanceToSegment(vec2 a, vec2 b, vec2 p, out float projection){\n\tvec2 d = p - a;\n\tvec2 x = b - a;\n\tif(dot(x,x) <= 0.0001) return length(d);\n\tprojection = dot(d, normalize(x));\n\n\tif(projection < 0.0)            return length(d);\n\telse if(projection > length(x)) return length(p - b);\n\treturn sqrt(abs(dot(d,d) - projection*projection));\n}\nfloat distanceToSegment(vec2 a, vec2 b, vec2 p){\n\tfloat projection;\n\treturn distanceToSegment(a, b, p, projection);\n}\n\tuniform bool isMouseDown;\n\tuniform vec2 mouseClipSpace;\n\tuniform vec2 lastMouseClipSpace;\n\tvoid main(){\n\t\tvec4 color = texture2D(dye, texelCoord);\n\t\tcolor.r *= (0.9797);\n\t\tcolor.g *= (0.9494);\n\t\tcolor.b *= (0.9696);\n\t\tif(isMouseDown){\t\t\t\n\t\t\tvec2 mouse = clipToSimSpace(mouseClipSpace);\n\t\t\tvec2 lastMouse = clipToSimSpace(lastMouseClipSpace);\n\t\t\tvec2 mouseVelocity = -(lastMouse - mouse)/dt;\n\t\t\t\n\t\t\t\n\t\t\tfloat projection;\n\t\t\tfloat l = distanceToSegment(mouse, lastMouse, p, projection);\n\t\t\tfloat taperFactor = 0.6;\n\t\t\tfloat projectedFraction = 1.0 - clamp(projection / distance(mouse, lastMouse), 0.0, 1.0)*taperFactor;\n\t\t\tfloat R = 0.025;\n\t\t\tfloat m = exp(-l/R);\n\t\t\t\n \t\t\tfloat speed = length(mouseVelocity);\n\t\t\tfloat x = clamp((speed * speed * 0.02 - l * 5.0) * projectedFraction, 0., 1.);\n\t\t\tcolor.rgb += m * (\n\t\t\t\tmix(vec3(2.4, 0, 5.9) / 60.0, vec3(0.2, 51.8, 100) / 30.0, x)\n \t\t\t\t+ (vec3(100) / 100.) * pow(x, 9.)\n\t\t\t);\n\t\t}\n\t\tgl_FragColor = color;\n\t}\n");
		this.ready = true;
	}
	,createProperties: function() {
		UpdateDye.prototype.createProperties.call(this);
		var instance = Type.createInstance(Type.resolveClass("shaderblox.uniforms.UBool"),["isMouseDown",-1]);
		this.isMouseDown = instance;
		this.uniforms.push(instance);
		var instance1 = Type.createInstance(Type.resolveClass("shaderblox.uniforms.UVec2"),["mouseClipSpace",-1]);
		this.mouseClipSpace = instance1;
		this.uniforms.push(instance1);
		var instance2 = Type.createInstance(Type.resolveClass("shaderblox.uniforms.UVec2"),["lastMouseClipSpace",-1]);
		this.lastMouseClipSpace = instance2;
		this.uniforms.push(instance2);
		this.aStride += 0;
	}
	,__class__: MouseDye
});
var MouseForce = function() {
	ApplyForces.call(this);
};
$hxClasses["MouseForce"] = MouseForce;
MouseForce.__name__ = true;
MouseForce.__super__ = ApplyForces;
MouseForce.prototype = $extend(ApplyForces.prototype,{
	create: function() {
		this.initFromSource("\n#ifdef GL_ES\nprecision mediump float;\n#endif\n\n \r\nattribute vec2 vertexPosition;\r\n\r\nuniform float aspectRatio;\r\n\r\nvarying vec2 texelCoord;\r\n\r\n\r\nvarying vec2 p;\r\n\r\nvoid main() {\r\n\ttexelCoord = vertexPosition;\r\n\t\r\n\tvec2 clipSpace = 2.0*texelCoord - 1.0;\t\n\t\r\n\tp = vec2(clipSpace.x * aspectRatio, clipSpace.y);\r\n\r\n\tgl_Position = vec4(clipSpace, 0.0, 1.0 );\t\r\n}\r\n\n\n\n\n\n","\n#ifdef GL_ES\nprecision mediump float;\n#endif\n\n#define PRESSURE_BOUNDARY\n#define VELOCITY_BOUNDARY\n\nuniform vec2 invresolution;\nuniform float aspectRatio;\n\nvec2 clipToSimSpace(vec2 clipSpace){\n    return  vec2(clipSpace.x * aspectRatio, clipSpace.y);\n}\n\nvec2 simToTexelSpace(vec2 simSpace){\n    return vec2(simSpace.x / aspectRatio + 1.0 , simSpace.y + 1.0)*.5;\n}\n\n\nfloat samplePressue(sampler2D pressure, vec2 coord){\n    vec2 cellOffset = vec2(0.0, 0.0);\n\n    \n    \n    \n    #ifdef PRESSURE_BOUNDARY\n    if(coord.x < 0.0)      cellOffset.x = 1.0;\n    else if(coord.x > 1.0) cellOffset.x = -1.0;\n    if(coord.y < 0.0)      cellOffset.y = 1.0;\n    else if(coord.y > 1.0) cellOffset.y = -1.0;\n    #endif\n\n    return texture2D(pressure, coord + cellOffset * invresolution).x;\n}\n\n\nvec2 sampleVelocity(sampler2D velocity, vec2 coord){\n    vec2 cellOffset = vec2(0.0, 0.0);\n    vec2 multiplier = vec2(1.0, 1.0);\n\n    \n    \n    \n    #ifdef VELOCITY_BOUNDARY\n    if(coord.x<0.0){\n        cellOffset.x = 1.0;\n        multiplier.x = -1.0;\n    }else if(coord.x>1.0){\n        cellOffset.x = -1.0;\n        multiplier.x = -1.0;\n    }\n    if(coord.y<0.0){\n        cellOffset.y = 1.0;\n        multiplier.y = -1.0;\n    }else if(coord.y>1.0){\n        cellOffset.y = -1.0;\n        multiplier.y = -1.0;\n    }\n    #endif\n\n    return multiplier * texture2D(velocity, coord + cellOffset * invresolution).xy;\n}\n\nuniform sampler2D velocity;\n\tuniform float dt;\n\tuniform float dx;\n\tvarying vec2 texelCoord;\n\tvarying vec2 p;\n\n\nfloat distanceToSegment(vec2 a, vec2 b, vec2 p, out float projection){\n\tvec2 d = p - a;\n\tvec2 x = b - a;\n\tif(dot(x,x) <= 0.0001) return length(d);\n\tprojection = dot(d, normalize(x));\n\n\tif(projection < 0.0)            return length(d);\n\telse if(projection > length(x)) return length(p - b);\n\treturn sqrt(abs(dot(d,d) - projection*projection));\n}\nfloat distanceToSegment(vec2 a, vec2 b, vec2 p){\n\tfloat projection;\n\treturn distanceToSegment(a, b, p, projection);\n}\n\tuniform bool isMouseDown;\n\tuniform vec2 mouseClipSpace;\n\tuniform vec2 lastMouseClipSpace;\n\tvoid main(){\n\t\tvec2 v = texture2D(velocity, texelCoord).xy;\n\t\tv.xy *= 0.999;\n\t\tif(isMouseDown){\n\t\t\tvec2 mouse = clipToSimSpace(mouseClipSpace) ;\n\t\t\tvec2 lastMouse = clipToSimSpace(lastMouseClipSpace);\n\t\t\tvec2 mouseVelocity = -(lastMouse - mouse)/dt;\n\t\t\t\n\t\t\t\t\n\t\t\t\n\t\t\tfloat projection;\n\t\t\tfloat l = distanceToSegment(mouse, lastMouse, p, projection);\n\t\t\tfloat taperFactor = 0.6;\n\t\t\tfloat projectedFraction = 1.0 - clamp(projection / distance(mouse, lastMouse), 0.0, 1.0)*taperFactor;\n\t\t\tfloat R = 0.015;\n\t\t\tfloat m = exp(-l/R); \n\t\t\tm *= projectedFraction * projectedFraction;\n\t\t\tvec2 targetVelocity = mouseVelocity * dx * 1.4;\n\t\t\tv += (targetVelocity - v)*m;\n\t\t}\n\t\tgl_FragColor = vec4(v, 0, 1.);\n\t}\n");
		this.ready = true;
	}
	,createProperties: function() {
		ApplyForces.prototype.createProperties.call(this);
		var instance = Type.createInstance(Type.resolveClass("shaderblox.uniforms.UBool"),["isMouseDown",-1]);
		this.isMouseDown = instance;
		this.uniforms.push(instance);
		var instance1 = Type.createInstance(Type.resolveClass("shaderblox.uniforms.UVec2"),["mouseClipSpace",-1]);
		this.mouseClipSpace = instance1;
		this.uniforms.push(instance1);
		var instance2 = Type.createInstance(Type.resolveClass("shaderblox.uniforms.UVec2"),["lastMouseClipSpace",-1]);
		this.lastMouseClipSpace = instance2;
		this.uniforms.push(instance2);
		this.aStride += 0;
	}
	,__class__: MouseForce
});
var IMap = function() { };
$hxClasses["IMap"] = IMap;
IMap.__name__ = true;
IMap.prototype = {
	__class__: IMap
};
Math.__name__ = true;
var PerformanceMonitor = function(lowerBoundFPS,upperBoundFPS,thresholdTime_ms,fpsSampleSize) {
	if(fpsSampleSize == null) fpsSampleSize = 30;
	if(thresholdTime_ms == null) thresholdTime_ms = 3000;
	if(lowerBoundFPS == null) lowerBoundFPS = 30;
	this.upperBoundEnterTime = null;
	this.lowerBoundEnterTime = null;
	this.fpsTooHighCallback = null;
	this.fpsTooLowCallback = null;
	this.fpsIgnoreBounds = [5,180];
	this.lowerBoundFPS = lowerBoundFPS;
	this.upperBoundFPS = upperBoundFPS;
	this.thresholdTime_ms = thresholdTime_ms;
	this.fpsSample = new RollingSample(fpsSampleSize);
};
$hxClasses["PerformanceMonitor"] = PerformanceMonitor;
PerformanceMonitor.__name__ = true;
PerformanceMonitor.prototype = {
	recordFrameTime: function(dt_seconds) {
		if(dt_seconds > 0) this.recordFPS(1 / dt_seconds);
	}
	,recordFPS: function(fps) {
		if(fps < this.fpsIgnoreBounds[0] && fps > this.fpsIgnoreBounds[1]) return;
		this.fpsSample.add(fps);
		if(this.fpsSample.sampleCount < this.fpsSample.length) return;
		var now = haxe.Timer.stamp() * 1000;
		if(this.fpsSample.average < this.lowerBoundFPS) {
			if(this.lowerBoundEnterTime == null) this.lowerBoundEnterTime = now;
			if(now - this.lowerBoundEnterTime >= this.thresholdTime_ms && this.fpsTooLowCallback != null) {
				this.fpsTooLowCallback((this.lowerBoundFPS - this.fpsSample.average) / this.lowerBoundFPS);
				this.fpsSample.clear();
				this.lowerBoundEnterTime = null;
			}
		} else if(this.fpsSample.average > this.upperBoundFPS) {
			if(this.upperBoundEnterTime == null) this.upperBoundEnterTime = now;
			if(now - this.upperBoundEnterTime >= this.thresholdTime_ms && this.fpsTooHighCallback != null) {
				this.fpsTooHighCallback((this.fpsSample.average - this.upperBoundFPS) / this.upperBoundFPS);
				this.fpsSample.clear();
				this.upperBoundEnterTime = null;
			}
		} else {
			this.lowerBoundEnterTime = null;
			this.upperBoundEnterTime = null;
		}
	}
	,get_fpsAverage: function() {
		return this.fpsSample.average;
	}
	,get_fpsVariance: function() {
		return this.fpsSample.get_variance();
	}
	,get_fpsStandardDeviation: function() {
		return this.fpsSample.get_standardDeviation();
	}
	,__class__: PerformanceMonitor
};
var RollingSample = function(length) {
	this.m2 = 0;
	this.pos = 0;
	this.sampleCount = 0;
	this.standardDeviation = 0;
	this.variance = 0;
	this.average = 0;
	var this1;
	this1 = new Array(length);
	this.samples = this1;
};
$hxClasses["RollingSample"] = RollingSample;
RollingSample.__name__ = true;
RollingSample.prototype = {
	add: function(v) {
		var delta;
		if(this.sampleCount >= this.samples.length) {
			var bottomValue = this.samples[this.pos];
			delta = bottomValue - this.average;
			this.average -= delta / (this.sampleCount - 1);
			this.m2 -= delta * (bottomValue - this.average);
		} else this.sampleCount++;
		delta = v - this.average;
		this.average += delta / this.sampleCount;
		this.m2 += delta * (v - this.average);
		this.samples[this.pos] = v;
		this.pos++;
		this.pos %= this.samples.length;
		return this.pos;
	}
	,clear: function() {
		var _g1 = 0;
		var _g = this.samples.length;
		while(_g1 < _g) {
			var i = _g1++;
			this.samples[i] = 0;
		}
		this.average = 0;
		this.variance = 0;
		this.standardDeviation = 0;
		this.sampleCount = 0;
		this.m2 = 0;
	}
	,get_variance: function() {
		return this.m2 / (this.sampleCount - 1);
	}
	,get_standardDeviation: function() {
		return Math.sqrt(this.get_variance());
	}
	,get_length: function() {
		return this.samples.length;
	}
	,__class__: RollingSample
};
var Reflect = function() { };
$hxClasses["Reflect"] = Reflect;
Reflect.__name__ = true;
Reflect.field = function(o,field) {
	try {
		return o[field];
	} catch( e ) {
		return null;
	}
};
Reflect.fields = function(o) {
	var a = [];
	if(o != null) {
		var hasOwnProperty = Object.prototype.hasOwnProperty;
		for( var f in o ) {
		if(f != "__id__" && f != "hx__closures__" && hasOwnProperty.call(o,f)) a.push(f);
		}
	}
	return a;
};
Reflect.isFunction = function(f) {
	return typeof(f) == "function" && !(f.__name__ || f.__ename__);
};
var SnowApp = function() { };
$hxClasses["SnowApp"] = SnowApp;
SnowApp.__name__ = true;
SnowApp.main = function() {
	SnowApp._snow = new snow.Snow();
	SnowApp._host = new Main();
	var _snow_config = { has_loop : true, config_custom_assets : false, config_custom_runtime : false, config_runtime_path : "config.json", config_assets_path : "manifest"};
	SnowApp._snow.init(_snow_config,SnowApp._host);
};
var Std = function() { };
$hxClasses["Std"] = Std;
Std.__name__ = true;
Std.string = function(s) {
	return js.Boot.__string_rec(s,"");
};
Std["int"] = function(x) {
	return x | 0;
};
Std.parseInt = function(x) {
	var v = parseInt(x,10);
	if(v == 0 && (HxOverrides.cca(x,1) == 120 || HxOverrides.cca(x,1) == 88)) v = parseInt(x);
	if(isNaN(v)) return null;
	return v;
};
var StringTools = function() { };
$hxClasses["StringTools"] = StringTools;
StringTools.__name__ = true;
StringTools.isSpace = function(s,pos) {
	var c = HxOverrides.cca(s,pos);
	return c > 8 && c < 14 || c == 32;
};
StringTools.ltrim = function(s) {
	var l = s.length;
	var r = 0;
	while(r < l && StringTools.isSpace(s,r)) r++;
	if(r > 0) return HxOverrides.substr(s,r,l - r); else return s;
};
StringTools.rtrim = function(s) {
	var l = s.length;
	var r = 0;
	while(r < l && StringTools.isSpace(s,l - r - 1)) r++;
	if(r > 0) return HxOverrides.substr(s,0,l - r); else return s;
};
StringTools.trim = function(s) {
	return StringTools.ltrim(StringTools.rtrim(s));
};
var Type = function() { };
$hxClasses["Type"] = Type;
Type.__name__ = true;
Type.getClass = function(o) {
	if(o == null) return null;
	if((o instanceof Array) && o.__enum__ == null) return Array; else return o.__class__;
};
Type.resolveClass = function(name) {
	var cl = $hxClasses[name];
	if(cl == null || !cl.__name__) return null;
	return cl;
};
Type.createInstance = function(cl,args) {
	var _g = args.length;
	switch(_g) {
	case 0:
		return new cl();
	case 1:
		return new cl(args[0]);
	case 2:
		return new cl(args[0],args[1]);
	case 3:
		return new cl(args[0],args[1],args[2]);
	case 4:
		return new cl(args[0],args[1],args[2],args[3]);
	case 5:
		return new cl(args[0],args[1],args[2],args[3],args[4]);
	case 6:
		return new cl(args[0],args[1],args[2],args[3],args[4],args[5]);
	case 7:
		return new cl(args[0],args[1],args[2],args[3],args[4],args[5],args[6]);
	case 8:
		return new cl(args[0],args[1],args[2],args[3],args[4],args[5],args[6],args[7]);
	default:
		throw "Too many arguments";
	}
	return null;
};
Type.createEnum = function(e,constr,params) {
	var f = Reflect.field(e,constr);
	if(f == null) throw "No such constructor " + constr;
	if(Reflect.isFunction(f)) {
		if(params == null) throw "Constructor " + constr + " need parameters";
		return f.apply(e,params);
	}
	if(params != null && params.length != 0) throw "Constructor " + constr + " does not need parameters";
	return f;
};
Type.createEnumIndex = function(e,index,params) {
	var c = e.__constructs__[index];
	if(c == null) throw index + " is not a valid enum constructor index";
	return Type.createEnum(e,c,params);
};
Type.allEnums = function(e) {
	return e.__empty_constructs__;
};
var gltoolbox = {};
gltoolbox.GeometryTools = function() { };
$hxClasses["gltoolbox.GeometryTools"] = gltoolbox.GeometryTools;
gltoolbox.GeometryTools.__name__ = true;
gltoolbox.GeometryTools.getCachedTextureQuad = function(drawMode) {
	if(drawMode == null) drawMode = 5;
	var textureQuad = gltoolbox.GeometryTools.textureQuadCache.get(drawMode);
	if(textureQuad == null || !snow.platform.web.render.opengl.GL.isBuffer(textureQuad)) {
		textureQuad = gltoolbox.GeometryTools.createQuad(0,0,1,1,drawMode);
		gltoolbox.GeometryTools.textureQuadCache.set(drawMode,textureQuad);
	}
	return textureQuad;
};
gltoolbox.GeometryTools.getCachedClipSpaceQuad = function(drawMode) {
	if(drawMode == null) drawMode = 5;
	var clipSpaceQuad = gltoolbox.GeometryTools.clipSpaceQuadCache.get(drawMode);
	if(clipSpaceQuad == null || !snow.platform.web.render.opengl.GL.isBuffer(clipSpaceQuad)) {
		clipSpaceQuad = gltoolbox.GeometryTools.createQuad(-1,-1,2,2,drawMode);
		gltoolbox.GeometryTools.clipSpaceQuadCache.set(drawMode,clipSpaceQuad);
	}
	return clipSpaceQuad;
};
gltoolbox.GeometryTools.createTextureQuad = function(drawMode) {
	if(drawMode == null) drawMode = 5;
	return gltoolbox.GeometryTools.createQuad(0,0,1,1,drawMode);
};
gltoolbox.GeometryTools.createClipSpaceQuad = function(drawMode) {
	if(drawMode == null) drawMode = 5;
	return gltoolbox.GeometryTools.createQuad(-1,-1,2,2,drawMode);
};
gltoolbox.GeometryTools.createQuad = function(originX,originY,width,height,drawMode,usage) {
	if(usage == null) usage = 35044;
	if(drawMode == null) drawMode = 5;
	if(height == null) height = 1;
	if(width == null) width = 1;
	if(originY == null) originY = 0;
	if(originX == null) originX = 0;
	var quad = snow.platform.web.render.opengl.GL.createBuffer();
	var vertices = new Array();
	switch(drawMode) {
	case 5:case 4:
		vertices = [originX,originY + height,originX,originY,originX + width,originY + height,originX + width,originY];
		if(drawMode == 4) vertices = vertices.concat([originX + width,originY + height,originX,originY]);
		break;
	case 6:
		vertices = [originX,originY + height,originX,originY,originX + width,originY,originX + width,originY + height];
		break;
	}
	snow.platform.web.render.opengl.GL.bindBuffer(34962,quad);
	snow.platform.web.render.opengl.GL.bufferData(34962,new Float32Array(vertices),usage);
	snow.platform.web.render.opengl.GL.bindBuffer(34962,null);
	return quad;
};
gltoolbox.GeometryTools.boundaryLinesArray = function(width,height) {
	return new Float32Array([0.5,0,0.5,height,0,height - 0.5,width,height - 0.5,width - 0.5,height,width - 0.5,0,width,0.5,0,0.5]);
};
gltoolbox.TextureTools = function() { };
$hxClasses["gltoolbox.TextureTools"] = gltoolbox.TextureTools;
gltoolbox.TextureTools.__name__ = true;
gltoolbox.TextureTools.createTextureFactory = function(channelType,dataType,filter,unpackAlignment) {
	if(unpackAlignment == null) unpackAlignment = 4;
	if(filter == null) filter = 9728;
	if(dataType == null) dataType = 5121;
	if(channelType == null) channelType = 6408;
	return function(width,height) {
		return gltoolbox.TextureTools.textureFactory(width,height,channelType,dataType,filter,unpackAlignment);
	};
};
gltoolbox.TextureTools.floatTextureFactoryRGB = function(width,height) {
	return gltoolbox.TextureTools.textureFactory(width,height,6407,5126,null,null);
};
gltoolbox.TextureTools.floatTextureFactoryRGBA = function(width,height) {
	return gltoolbox.TextureTools.textureFactory(width,height,6408,5126,null,null);
};
gltoolbox.TextureTools.textureFactory = function(width,height,channelType,dataType,filter,unpackAlignment) {
	if(unpackAlignment == null) unpackAlignment = 4;
	if(filter == null) filter = 9728;
	if(dataType == null) dataType = 5121;
	if(channelType == null) channelType = 6408;
	var texture = snow.platform.web.render.opengl.GL.createTexture();
	snow.platform.web.render.opengl.GL.bindTexture(3553,texture);
	snow.platform.web.render.opengl.GL.texParameteri(3553,10241,filter);
	snow.platform.web.render.opengl.GL.texParameteri(3553,10240,filter);
	snow.platform.web.render.opengl.GL.texParameteri(3553,10242,33071);
	snow.platform.web.render.opengl.GL.texParameteri(3553,10243,33071);
	snow.platform.web.render.opengl.GL.pixelStorei(3317,4);
	snow.platform.web.render.opengl.GL.texImage2D(3553,0,channelType,width,height,0,channelType,dataType,null);
	snow.platform.web.render.opengl.GL.bindTexture(3553,null);
	return texture;
};
gltoolbox.render = {};
gltoolbox.render.ITargetable = function() { };
$hxClasses["gltoolbox.render.ITargetable"] = gltoolbox.render.ITargetable;
gltoolbox.render.ITargetable.__name__ = true;
gltoolbox.render.ITargetable.prototype = {
	__class__: gltoolbox.render.ITargetable
};
gltoolbox.render.RenderTarget = function(width,height,textureFactory) {
	if(textureFactory == null) textureFactory = gltoolbox.TextureTools.createTextureFactory(null,null,null,null);
	this.width = width;
	this.height = height;
	this.textureFactory = textureFactory;
	this.texture = textureFactory(width,height);
	if(gltoolbox.render.RenderTarget.textureQuad == null) gltoolbox.render.RenderTarget.textureQuad = gltoolbox.GeometryTools.getCachedTextureQuad(5);
	this.frameBufferObject = snow.platform.web.render.opengl.GL.createFramebuffer();
	this.resize(width,height);
};
$hxClasses["gltoolbox.render.RenderTarget"] = gltoolbox.render.RenderTarget;
gltoolbox.render.RenderTarget.__name__ = true;
gltoolbox.render.RenderTarget.__interfaces__ = [gltoolbox.render.ITargetable];
gltoolbox.render.RenderTarget.prototype = {
	resize: function(width,height) {
		var newTexture = this.textureFactory(width,height);
		snow.platform.web.render.opengl.GL.bindFramebuffer(36160,this.frameBufferObject);
		snow.platform.web.render.opengl.GL.framebufferTexture2D(36160,36064,3553,newTexture,0);
		if(this.texture != null) {
			var resampler = gltoolbox.shaders.Resample.instance;
			resampler.texture.set_data(this.texture);
			snow.platform.web.render.opengl.GL.bindFramebuffer(36160,this.frameBufferObject);
			snow.platform.web.render.opengl.GL.viewport(0,0,width,height);
			snow.platform.web.render.opengl.GL.bindBuffer(34962,gltoolbox.render.RenderTarget.textureQuad);
			if(resampler.active) {
				resampler.setUniforms();
				resampler.setAttributes();
				null;
			} else {
				if(!resampler.ready) resampler.create();
				snow.platform.web.render.opengl.GL.useProgram(resampler.prog);
				resampler.setUniforms();
				resampler.setAttributes();
				resampler.active = true;
			}
			snow.platform.web.render.opengl.GL.drawArrays(5,0,4);
			resampler.deactivate();
			snow.platform.web.render.opengl.GL.deleteTexture(this.texture);
		} else {
			snow.platform.web.render.opengl.GL.bindFramebuffer(36160,this.frameBufferObject);
			snow.platform.web.render.opengl.GL.clearColor(0,0,0,1);
			snow.platform.web.render.opengl.GL.clear(16384);
		}
		this.width = width;
		this.height = height;
		this.texture = newTexture;
		return this;
	}
	,activate: function() {
		snow.platform.web.render.opengl.GL.bindFramebuffer(36160,this.frameBufferObject);
	}
	,clear: function(mask) {
		if(mask == null) mask = 16384;
		snow.platform.web.render.opengl.GL.bindFramebuffer(36160,this.frameBufferObject);
		snow.platform.web.render.opengl.GL.clearColor(0,0,0,1);
		snow.platform.web.render.opengl.GL.clear(mask);
	}
	,dispose: function() {
		snow.platform.web.render.opengl.GL.deleteFramebuffer(this.frameBufferObject);
		snow.platform.web.render.opengl.GL.deleteTexture(this.texture);
	}
	,__class__: gltoolbox.render.RenderTarget
};
gltoolbox.render.RenderTarget2Phase = function(width,height,textureFactory) {
	if(textureFactory == null) textureFactory = gltoolbox.TextureTools.createTextureFactory(null,null,null,null);
	this.width = width;
	this.height = height;
	this.textureFactory = textureFactory;
	if(gltoolbox.render.RenderTarget2Phase.textureQuad == null) gltoolbox.render.RenderTarget2Phase.textureQuad = gltoolbox.GeometryTools.getCachedTextureQuad(5);
	this.writeFrameBufferObject = snow.platform.web.render.opengl.GL.createFramebuffer();
	this.readFrameBufferObject = snow.platform.web.render.opengl.GL.createFramebuffer();
	this.resize(width,height);
};
$hxClasses["gltoolbox.render.RenderTarget2Phase"] = gltoolbox.render.RenderTarget2Phase;
gltoolbox.render.RenderTarget2Phase.__name__ = true;
gltoolbox.render.RenderTarget2Phase.__interfaces__ = [gltoolbox.render.ITargetable];
gltoolbox.render.RenderTarget2Phase.prototype = {
	resize: function(width,height) {
		var newWriteToTexture = this.textureFactory(width,height);
		var newReadFromTexture = this.textureFactory(width,height);
		snow.platform.web.render.opengl.GL.bindFramebuffer(36160,this.writeFrameBufferObject);
		snow.platform.web.render.opengl.GL.framebufferTexture2D(36160,36064,3553,newWriteToTexture,0);
		snow.platform.web.render.opengl.GL.bindFramebuffer(36160,this.readFrameBufferObject);
		snow.platform.web.render.opengl.GL.framebufferTexture2D(36160,36064,3553,newReadFromTexture,0);
		if(this.readFromTexture != null) {
			var resampler = gltoolbox.shaders.Resample.instance;
			resampler.texture.set_data(this.readFromTexture);
			snow.platform.web.render.opengl.GL.bindFramebuffer(36160,this.readFrameBufferObject);
			snow.platform.web.render.opengl.GL.viewport(0,0,width,height);
			snow.platform.web.render.opengl.GL.bindBuffer(34962,gltoolbox.render.RenderTarget2Phase.textureQuad);
			if(resampler.active) {
				resampler.setUniforms();
				resampler.setAttributes();
				null;
			} else {
				if(!resampler.ready) resampler.create();
				snow.platform.web.render.opengl.GL.useProgram(resampler.prog);
				resampler.setUniforms();
				resampler.setAttributes();
				resampler.active = true;
			}
			snow.platform.web.render.opengl.GL.drawArrays(5,0,4);
			resampler.deactivate();
			snow.platform.web.render.opengl.GL.deleteTexture(this.readFromTexture);
		} else {
			snow.platform.web.render.opengl.GL.bindFramebuffer(36160,this.readFrameBufferObject);
			snow.platform.web.render.opengl.GL.clearColor(0,0,0,1);
			snow.platform.web.render.opengl.GL.clear(16384);
		}
		if(this.writeToTexture != null) snow.platform.web.render.opengl.GL.deleteTexture(this.writeToTexture); else {
			snow.platform.web.render.opengl.GL.bindFramebuffer(36160,this.writeFrameBufferObject);
			snow.platform.web.render.opengl.GL.clearColor(0,0,0,1);
			snow.platform.web.render.opengl.GL.clear(16384);
		}
		this.width = width;
		this.height = height;
		this.writeToTexture = newWriteToTexture;
		this.readFromTexture = newReadFromTexture;
		return this;
	}
	,activate: function() {
		snow.platform.web.render.opengl.GL.bindFramebuffer(36160,this.writeFrameBufferObject);
	}
	,swap: function() {
		this.tmpFBO = this.writeFrameBufferObject;
		this.writeFrameBufferObject = this.readFrameBufferObject;
		this.readFrameBufferObject = this.tmpFBO;
		this.tmpTex = this.writeToTexture;
		this.writeToTexture = this.readFromTexture;
		this.readFromTexture = this.tmpTex;
	}
	,clear: function(mask) {
		if(mask == null) mask = 16384;
		snow.platform.web.render.opengl.GL.bindFramebuffer(36160,this.readFrameBufferObject);
		snow.platform.web.render.opengl.GL.clearColor(0,0,0,1);
		snow.platform.web.render.opengl.GL.clear(mask);
		snow.platform.web.render.opengl.GL.bindFramebuffer(36160,this.writeFrameBufferObject);
		snow.platform.web.render.opengl.GL.clearColor(0,0,0,1);
		snow.platform.web.render.opengl.GL.clear(mask);
	}
	,clearRead: function(mask) {
		if(mask == null) mask = 16384;
		snow.platform.web.render.opengl.GL.bindFramebuffer(36160,this.readFrameBufferObject);
		snow.platform.web.render.opengl.GL.clearColor(0,0,0,1);
		snow.platform.web.render.opengl.GL.clear(mask);
	}
	,clearWrite: function(mask) {
		if(mask == null) mask = 16384;
		snow.platform.web.render.opengl.GL.bindFramebuffer(36160,this.writeFrameBufferObject);
		snow.platform.web.render.opengl.GL.clearColor(0,0,0,1);
		snow.platform.web.render.opengl.GL.clear(mask);
	}
	,dispose: function() {
		snow.platform.web.render.opengl.GL.deleteFramebuffer(this.writeFrameBufferObject);
		snow.platform.web.render.opengl.GL.deleteFramebuffer(this.readFrameBufferObject);
		snow.platform.web.render.opengl.GL.deleteTexture(this.writeToTexture);
		snow.platform.web.render.opengl.GL.deleteTexture(this.readFromTexture);
	}
	,__class__: gltoolbox.render.RenderTarget2Phase
};
var js = {};
js.Boot = function() { };
$hxClasses["js.Boot"] = js.Boot;
js.Boot.__name__ = true;
js.Boot.__unhtml = function(s) {
	return s.split("&").join("&amp;").split("<").join("&lt;").split(">").join("&gt;");
};
js.Boot.__trace = function(v,i) {
	var msg;
	if(i != null) msg = i.fileName + ":" + i.lineNumber + ": "; else msg = "";
	msg += js.Boot.__string_rec(v,"");
	if(i != null && i.customParams != null) {
		var _g = 0;
		var _g1 = i.customParams;
		while(_g < _g1.length) {
			var v1 = _g1[_g];
			++_g;
			msg += "," + js.Boot.__string_rec(v1,"");
		}
	}
	var d;
	if(typeof(document) != "undefined" && (d = document.getElementById("haxe:trace")) != null) d.innerHTML += js.Boot.__unhtml(msg) + "<br/>"; else if(typeof console != "undefined" && console.log != null) console.log(msg);
};
js.Boot.getClass = function(o) {
	if((o instanceof Array) && o.__enum__ == null) return Array; else return o.__class__;
};
js.Boot.__string_rec = function(o,s) {
	if(o == null) return "null";
	if(s.length >= 5) return "<...>";
	var t = typeof(o);
	if(t == "function" && (o.__name__ || o.__ename__)) t = "object";
	switch(t) {
	case "object":
		if(o instanceof Array) {
			if(o.__enum__) {
				if(o.length == 2) return o[0];
				var str = o[0] + "(";
				s += "\t";
				var _g1 = 2;
				var _g = o.length;
				while(_g1 < _g) {
					var i = _g1++;
					if(i != 2) str += "," + js.Boot.__string_rec(o[i],s); else str += js.Boot.__string_rec(o[i],s);
				}
				return str + ")";
			}
			var l = o.length;
			var i1;
			var str1 = "[";
			s += "\t";
			var _g2 = 0;
			while(_g2 < l) {
				var i2 = _g2++;
				str1 += (i2 > 0?",":"") + js.Boot.__string_rec(o[i2],s);
			}
			str1 += "]";
			return str1;
		}
		var tostr;
		try {
			tostr = o.toString;
		} catch( e ) {
			return "???";
		}
		if(tostr != null && tostr != Object.toString) {
			var s2 = o.toString();
			if(s2 != "[object Object]") return s2;
		}
		var k = null;
		var str2 = "{\n";
		s += "\t";
		var hasp = o.hasOwnProperty != null;
		for( var k in o ) {
		if(hasp && !o.hasOwnProperty(k)) {
			continue;
		}
		if(k == "prototype" || k == "__class__" || k == "__super__" || k == "__interfaces__" || k == "__properties__") {
			continue;
		}
		if(str2.length != 2) str2 += ", \n";
		str2 += s + k + " : " + js.Boot.__string_rec(o[k],s);
		}
		s = s.substring(1);
		str2 += "\n" + s + "}";
		return str2;
	case "function":
		return "<function>";
	case "string":
		return o;
	default:
		return String(o);
	}
};
js.Boot.__interfLoop = function(cc,cl) {
	if(cc == null) return false;
	if(cc == cl) return true;
	var intf = cc.__interfaces__;
	if(intf != null) {
		var _g1 = 0;
		var _g = intf.length;
		while(_g1 < _g) {
			var i = _g1++;
			var i1 = intf[i];
			if(i1 == cl || js.Boot.__interfLoop(i1,cl)) return true;
		}
	}
	return js.Boot.__interfLoop(cc.__super__,cl);
};
js.Boot.__instanceof = function(o,cl) {
	if(cl == null) return false;
	switch(cl) {
	case Int:
		return (o|0) === o;
	case Float:
		return typeof(o) == "number";
	case Bool:
		return typeof(o) == "boolean";
	case String:
		return typeof(o) == "string";
	case Array:
		return (o instanceof Array) && o.__enum__ == null;
	case Dynamic:
		return true;
	default:
		if(o != null) {
			if(typeof(cl) == "function") {
				if(o instanceof cl) return true;
				if(js.Boot.__interfLoop(js.Boot.getClass(o),cl)) return true;
			}
		} else return false;
		if(cl == Class && o.__name__ != null) return true;
		if(cl == Enum && o.__ename__ != null) return true;
		return o.__enum__ == cl;
	}
};
gltoolbox.shaders = {};
gltoolbox.shaders.Resample = function() {
	shaderblox.ShaderBase.call(this);
};
$hxClasses["gltoolbox.shaders.Resample"] = gltoolbox.shaders.Resample;
gltoolbox.shaders.Resample.__name__ = true;
gltoolbox.shaders.Resample.__super__ = shaderblox.ShaderBase;
gltoolbox.shaders.Resample.prototype = $extend(shaderblox.ShaderBase.prototype,{
	create: function() {
		this.initFromSource("\n#ifdef GL_ES\nprecision mediump float;\n#endif\n\nattribute vec2 vertexPosition;\n\tvarying vec2 texelCoord;\n\tvoid main(){\n\t\ttexelCoord = vertexPosition;\n\t\tgl_Position = vec4(vertexPosition*2.0 - 1.0, 0.0, 1.0 );\n\t}\n","\n#ifdef GL_ES\nprecision mediump float;\n#endif\n\nuniform sampler2D texture;\n\tvarying vec2 texelCoord;\n\tvoid main(){\n\t\tgl_FragColor = texture2D(texture, texelCoord);\n\t}\n");
		this.ready = true;
	}
	,createProperties: function() {
		shaderblox.ShaderBase.prototype.createProperties.call(this);
		var instance = Type.createInstance(Type.resolveClass("shaderblox.uniforms.UTexture"),["texture",-1,false]);
		this.texture = instance;
		this.uniforms.push(instance);
		var instance1 = Type.createInstance(Type.resolveClass("shaderblox.attributes.FloatAttribute"),["vertexPosition",0,2]);
		this.vertexPosition = instance1;
		this.attributes.push(instance1);
		this.aStride += 8;
	}
	,__class__: gltoolbox.shaders.Resample
});
var haxe = {};
haxe.Log = function() { };
$hxClasses["haxe.Log"] = haxe.Log;
haxe.Log.__name__ = true;
haxe.Log.trace = function(v,infos) {
	js.Boot.__trace(v,infos);
};
haxe.Timer = function() { };
$hxClasses["haxe.Timer"] = haxe.Timer;
haxe.Timer.__name__ = true;
haxe.Timer.stamp = function() {
	return new Date().getTime() / 1000;
};
haxe.Utf8 = function(size) {
	this.__b = "";
};
$hxClasses["haxe.Utf8"] = haxe.Utf8;
haxe.Utf8.__name__ = true;
haxe.Utf8.prototype = {
	__class__: haxe.Utf8
};
haxe.crypto = {};
haxe.crypto.Crc32 = function() {
	this.crc = -1;
};
$hxClasses["haxe.crypto.Crc32"] = haxe.crypto.Crc32;
haxe.crypto.Crc32.__name__ = true;
haxe.crypto.Crc32.prototype = {
	'byte': function(b) {
		var tmp = (this.crc ^ b) & 255;
		var _g = 0;
		while(_g < 8) {
			var j = _g++;
			if((tmp & 1) == 1) tmp = tmp >>> 1 ^ -306674912; else tmp >>>= 1;
		}
		this.crc = this.crc >>> 8 ^ tmp;
	}
	,update: function(b,pos,len) {
		var b1 = b.b;
		var _g1 = pos;
		var _g = pos + len;
		while(_g1 < _g) {
			var i = _g1++;
			var tmp = (this.crc ^ b1[i]) & 255;
			var _g2 = 0;
			while(_g2 < 8) {
				var j = _g2++;
				if((tmp & 1) == 1) tmp = tmp >>> 1 ^ -306674912; else tmp >>>= 1;
			}
			this.crc = this.crc >>> 8 ^ tmp;
		}
	}
	,get: function() {
		return this.crc ^ -1;
	}
	,__class__: haxe.crypto.Crc32
};
haxe.crypto.Md5 = function() {
};
$hxClasses["haxe.crypto.Md5"] = haxe.crypto.Md5;
haxe.crypto.Md5.__name__ = true;
haxe.crypto.Md5.encode = function(s) {
	var m = new haxe.crypto.Md5();
	var h = m.doEncode(haxe.crypto.Md5.str2blks(s));
	return m.hex(h);
};
haxe.crypto.Md5.str2blks = function(str) {
	var nblk = (str.length + 8 >> 6) + 1;
	var blks = new Array();
	var blksSize = nblk * 16;
	var _g = 0;
	while(_g < blksSize) {
		var i = _g++;
		blks[i] = 0;
	}
	var i1 = 0;
	while(i1 < str.length) {
		blks[i1 >> 2] |= HxOverrides.cca(str,i1) << (str.length * 8 + i1) % 4 * 8;
		i1++;
	}
	blks[i1 >> 2] |= 128 << (str.length * 8 + i1) % 4 * 8;
	var l = str.length * 8;
	var k = nblk * 16 - 2;
	blks[k] = l & 255;
	blks[k] |= (l >>> 8 & 255) << 8;
	blks[k] |= (l >>> 16 & 255) << 16;
	blks[k] |= (l >>> 24 & 255) << 24;
	return blks;
};
haxe.crypto.Md5.prototype = {
	bitOR: function(a,b) {
		var lsb = a & 1 | b & 1;
		var msb31 = a >>> 1 | b >>> 1;
		return msb31 << 1 | lsb;
	}
	,bitXOR: function(a,b) {
		var lsb = a & 1 ^ b & 1;
		var msb31 = a >>> 1 ^ b >>> 1;
		return msb31 << 1 | lsb;
	}
	,bitAND: function(a,b) {
		var lsb = a & 1 & (b & 1);
		var msb31 = a >>> 1 & b >>> 1;
		return msb31 << 1 | lsb;
	}
	,addme: function(x,y) {
		var lsw = (x & 65535) + (y & 65535);
		var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
		return msw << 16 | lsw & 65535;
	}
	,hex: function(a) {
		var str = "";
		var hex_chr = "0123456789abcdef";
		var _g = 0;
		while(_g < a.length) {
			var num = a[_g];
			++_g;
			var _g1 = 0;
			while(_g1 < 4) {
				var j = _g1++;
				str += hex_chr.charAt(num >> j * 8 + 4 & 15) + hex_chr.charAt(num >> j * 8 & 15);
			}
		}
		return str;
	}
	,rol: function(num,cnt) {
		return num << cnt | num >>> 32 - cnt;
	}
	,cmn: function(q,a,b,x,s,t) {
		return this.addme(this.rol(this.addme(this.addme(a,q),this.addme(x,t)),s),b);
	}
	,ff: function(a,b,c,d,x,s,t) {
		return this.cmn(this.bitOR(this.bitAND(b,c),this.bitAND(~b,d)),a,b,x,s,t);
	}
	,gg: function(a,b,c,d,x,s,t) {
		return this.cmn(this.bitOR(this.bitAND(b,d),this.bitAND(c,~d)),a,b,x,s,t);
	}
	,hh: function(a,b,c,d,x,s,t) {
		return this.cmn(this.bitXOR(this.bitXOR(b,c),d),a,b,x,s,t);
	}
	,ii: function(a,b,c,d,x,s,t) {
		return this.cmn(this.bitXOR(c,this.bitOR(b,~d)),a,b,x,s,t);
	}
	,doEncode: function(x) {
		var a = 1732584193;
		var b = -271733879;
		var c = -1732584194;
		var d = 271733878;
		var step;
		var i = 0;
		while(i < x.length) {
			var olda = a;
			var oldb = b;
			var oldc = c;
			var oldd = d;
			step = 0;
			a = this.ff(a,b,c,d,x[i],7,-680876936);
			d = this.ff(d,a,b,c,x[i + 1],12,-389564586);
			c = this.ff(c,d,a,b,x[i + 2],17,606105819);
			b = this.ff(b,c,d,a,x[i + 3],22,-1044525330);
			a = this.ff(a,b,c,d,x[i + 4],7,-176418897);
			d = this.ff(d,a,b,c,x[i + 5],12,1200080426);
			c = this.ff(c,d,a,b,x[i + 6],17,-1473231341);
			b = this.ff(b,c,d,a,x[i + 7],22,-45705983);
			a = this.ff(a,b,c,d,x[i + 8],7,1770035416);
			d = this.ff(d,a,b,c,x[i + 9],12,-1958414417);
			c = this.ff(c,d,a,b,x[i + 10],17,-42063);
			b = this.ff(b,c,d,a,x[i + 11],22,-1990404162);
			a = this.ff(a,b,c,d,x[i + 12],7,1804603682);
			d = this.ff(d,a,b,c,x[i + 13],12,-40341101);
			c = this.ff(c,d,a,b,x[i + 14],17,-1502002290);
			b = this.ff(b,c,d,a,x[i + 15],22,1236535329);
			a = this.gg(a,b,c,d,x[i + 1],5,-165796510);
			d = this.gg(d,a,b,c,x[i + 6],9,-1069501632);
			c = this.gg(c,d,a,b,x[i + 11],14,643717713);
			b = this.gg(b,c,d,a,x[i],20,-373897302);
			a = this.gg(a,b,c,d,x[i + 5],5,-701558691);
			d = this.gg(d,a,b,c,x[i + 10],9,38016083);
			c = this.gg(c,d,a,b,x[i + 15],14,-660478335);
			b = this.gg(b,c,d,a,x[i + 4],20,-405537848);
			a = this.gg(a,b,c,d,x[i + 9],5,568446438);
			d = this.gg(d,a,b,c,x[i + 14],9,-1019803690);
			c = this.gg(c,d,a,b,x[i + 3],14,-187363961);
			b = this.gg(b,c,d,a,x[i + 8],20,1163531501);
			a = this.gg(a,b,c,d,x[i + 13],5,-1444681467);
			d = this.gg(d,a,b,c,x[i + 2],9,-51403784);
			c = this.gg(c,d,a,b,x[i + 7],14,1735328473);
			b = this.gg(b,c,d,a,x[i + 12],20,-1926607734);
			a = this.hh(a,b,c,d,x[i + 5],4,-378558);
			d = this.hh(d,a,b,c,x[i + 8],11,-2022574463);
			c = this.hh(c,d,a,b,x[i + 11],16,1839030562);
			b = this.hh(b,c,d,a,x[i + 14],23,-35309556);
			a = this.hh(a,b,c,d,x[i + 1],4,-1530992060);
			d = this.hh(d,a,b,c,x[i + 4],11,1272893353);
			c = this.hh(c,d,a,b,x[i + 7],16,-155497632);
			b = this.hh(b,c,d,a,x[i + 10],23,-1094730640);
			a = this.hh(a,b,c,d,x[i + 13],4,681279174);
			d = this.hh(d,a,b,c,x[i],11,-358537222);
			c = this.hh(c,d,a,b,x[i + 3],16,-722521979);
			b = this.hh(b,c,d,a,x[i + 6],23,76029189);
			a = this.hh(a,b,c,d,x[i + 9],4,-640364487);
			d = this.hh(d,a,b,c,x[i + 12],11,-421815835);
			c = this.hh(c,d,a,b,x[i + 15],16,530742520);
			b = this.hh(b,c,d,a,x[i + 2],23,-995338651);
			a = this.ii(a,b,c,d,x[i],6,-198630844);
			d = this.ii(d,a,b,c,x[i + 7],10,1126891415);
			c = this.ii(c,d,a,b,x[i + 14],15,-1416354905);
			b = this.ii(b,c,d,a,x[i + 5],21,-57434055);
			a = this.ii(a,b,c,d,x[i + 12],6,1700485571);
			d = this.ii(d,a,b,c,x[i + 3],10,-1894986606);
			c = this.ii(c,d,a,b,x[i + 10],15,-1051523);
			b = this.ii(b,c,d,a,x[i + 1],21,-2054922799);
			a = this.ii(a,b,c,d,x[i + 8],6,1873313359);
			d = this.ii(d,a,b,c,x[i + 15],10,-30611744);
			c = this.ii(c,d,a,b,x[i + 6],15,-1560198380);
			b = this.ii(b,c,d,a,x[i + 13],21,1309151649);
			a = this.ii(a,b,c,d,x[i + 4],6,-145523070);
			d = this.ii(d,a,b,c,x[i + 11],10,-1120210379);
			c = this.ii(c,d,a,b,x[i + 2],15,718787259);
			b = this.ii(b,c,d,a,x[i + 9],21,-343485551);
			a = this.addme(a,olda);
			b = this.addme(b,oldb);
			c = this.addme(c,oldc);
			d = this.addme(d,oldd);
			i += 16;
		}
		return [a,b,c,d];
	}
	,__class__: haxe.crypto.Md5
};
haxe.ds = {};
haxe.ds.IntMap = function() {
	this.h = { };
};
$hxClasses["haxe.ds.IntMap"] = haxe.ds.IntMap;
haxe.ds.IntMap.__name__ = true;
haxe.ds.IntMap.__interfaces__ = [IMap];
haxe.ds.IntMap.prototype = {
	set: function(key,value) {
		this.h[key] = value;
	}
	,get: function(key) {
		return this.h[key];
	}
	,exists: function(key) {
		return this.h.hasOwnProperty(key);
	}
	,remove: function(key) {
		if(!this.h.hasOwnProperty(key)) return false;
		delete(this.h[key]);
		return true;
	}
	,keys: function() {
		var a = [];
		for( var key in this.h ) {
		if(this.h.hasOwnProperty(key)) a.push(key | 0);
		}
		return HxOverrides.iter(a);
	}
	,iterator: function() {
		return { ref : this.h, it : this.keys(), hasNext : function() {
			return this.it.hasNext();
		}, next : function() {
			var i = this.it.next();
			return this.ref[i];
		}};
	}
	,__class__: haxe.ds.IntMap
};
haxe.ds.ObjectMap = function() {
	this.h = { };
	this.h.__keys__ = { };
};
$hxClasses["haxe.ds.ObjectMap"] = haxe.ds.ObjectMap;
haxe.ds.ObjectMap.__name__ = true;
haxe.ds.ObjectMap.__interfaces__ = [IMap];
haxe.ds.ObjectMap.prototype = {
	set: function(key,value) {
		var id = key.__id__ || (key.__id__ = ++haxe.ds.ObjectMap.count);
		this.h[id] = value;
		this.h.__keys__[id] = key;
	}
	,remove: function(key) {
		var id = key.__id__;
		if(this.h.__keys__[id] == null) return false;
		delete(this.h[id]);
		delete(this.h.__keys__[id]);
		return true;
	}
	,keys: function() {
		var a = [];
		for( var key in this.h.__keys__ ) {
		if(this.h.hasOwnProperty(key)) a.push(this.h.__keys__[key]);
		}
		return HxOverrides.iter(a);
	}
	,iterator: function() {
		return { ref : this.h, it : this.keys(), hasNext : function() {
			return this.it.hasNext();
		}, next : function() {
			var i = this.it.next();
			return this.ref[i.__id__];
		}};
	}
	,__class__: haxe.ds.ObjectMap
};
haxe.ds.StringMap = function() {
	this.h = { };
};
$hxClasses["haxe.ds.StringMap"] = haxe.ds.StringMap;
haxe.ds.StringMap.__name__ = true;
haxe.ds.StringMap.__interfaces__ = [IMap];
haxe.ds.StringMap.prototype = {
	set: function(key,value) {
		this.h["$" + key] = value;
	}
	,get: function(key) {
		return this.h["$" + key];
	}
	,exists: function(key) {
		return this.h.hasOwnProperty("$" + key);
	}
	,remove: function(key) {
		key = "$" + key;
		if(!this.h.hasOwnProperty(key)) return false;
		delete(this.h[key]);
		return true;
	}
	,keys: function() {
		var a = [];
		for( var key in this.h ) {
		if(this.h.hasOwnProperty(key)) a.push(key.substr(1));
		}
		return HxOverrides.iter(a);
	}
	,iterator: function() {
		return { ref : this.h, it : this.keys(), hasNext : function() {
			return this.it.hasNext();
		}, next : function() {
			var i = this.it.next();
			return this.ref["$" + i];
		}};
	}
	,__class__: haxe.ds.StringMap
};
haxe.io = {};
haxe.io.Bytes = function(length,b) {
	this.length = length;
	this.b = b;
};
$hxClasses["haxe.io.Bytes"] = haxe.io.Bytes;
haxe.io.Bytes.__name__ = true;
haxe.io.Bytes.alloc = function(length) {
	var a = new Array();
	var _g = 0;
	while(_g < length) {
		var i = _g++;
		a.push(0);
	}
	return new haxe.io.Bytes(length,a);
};
haxe.io.Bytes.prototype = {
	get: function(pos) {
		return this.b[pos];
	}
	,set: function(pos,v) {
		this.b[pos] = v & 255;
	}
	,blit: function(pos,src,srcpos,len) {
		if(pos < 0 || srcpos < 0 || len < 0 || pos + len > this.length || srcpos + len > src.length) throw haxe.io.Error.OutsideBounds;
		var b1 = this.b;
		var b2 = src.b;
		if(b1 == b2 && pos > srcpos) {
			var i = len;
			while(i > 0) {
				i--;
				b1[i + pos] = b2[i + srcpos];
			}
			return;
		}
		var _g = 0;
		while(_g < len) {
			var i1 = _g++;
			b1[i1 + pos] = b2[i1 + srcpos];
		}
	}
	,getString: function(pos,len) {
		if(pos < 0 || len < 0 || pos + len > this.length) throw haxe.io.Error.OutsideBounds;
		var s = "";
		var b = this.b;
		var fcc = String.fromCharCode;
		var i = pos;
		var max = pos + len;
		while(i < max) {
			var c = b[i++];
			if(c < 128) {
				if(c == 0) break;
				s += fcc(c);
			} else if(c < 224) s += fcc((c & 63) << 6 | b[i++] & 127); else if(c < 240) {
				var c2 = b[i++];
				s += fcc((c & 31) << 12 | (c2 & 127) << 6 | b[i++] & 127);
			} else {
				var c21 = b[i++];
				var c3 = b[i++];
				var u = (c & 15) << 18 | (c21 & 127) << 12 | (c3 & 127) << 6 | b[i++] & 127;
				s += fcc((u >> 10) + 55232);
				s += fcc(u & 1023 | 56320);
			}
		}
		return s;
	}
	,toString: function() {
		return this.getString(0,this.length);
	}
	,__class__: haxe.io.Bytes
};
haxe.io.BytesBuffer = function() {
	this.b = new Array();
};
$hxClasses["haxe.io.BytesBuffer"] = haxe.io.BytesBuffer;
haxe.io.BytesBuffer.__name__ = true;
haxe.io.BytesBuffer.prototype = {
	add: function(src) {
		var b1 = this.b;
		var b2 = src.b;
		var _g1 = 0;
		var _g = src.length;
		while(_g1 < _g) {
			var i = _g1++;
			this.b.push(b2[i]);
		}
	}
	,addBytes: function(src,pos,len) {
		if(pos < 0 || len < 0 || pos + len > src.length) throw haxe.io.Error.OutsideBounds;
		var b1 = this.b;
		var b2 = src.b;
		var _g1 = pos;
		var _g = pos + len;
		while(_g1 < _g) {
			var i = _g1++;
			this.b.push(b2[i]);
		}
	}
	,getBytes: function() {
		var bytes = new haxe.io.Bytes(this.b.length,this.b);
		this.b = null;
		return bytes;
	}
	,__class__: haxe.io.BytesBuffer
};
haxe.io.Input = function() { };
$hxClasses["haxe.io.Input"] = haxe.io.Input;
haxe.io.Input.__name__ = true;
haxe.io.Input.prototype = {
	readByte: function() {
		throw "Not implemented";
	}
	,readBytes: function(s,pos,len) {
		var k = len;
		var b = s.b;
		if(pos < 0 || len < 0 || pos + len > s.length) throw haxe.io.Error.OutsideBounds;
		while(k > 0) {
			b[pos] = this.readByte();
			pos++;
			k--;
		}
		return len;
	}
	,set_bigEndian: function(b) {
		this.bigEndian = b;
		return b;
	}
	,readFullBytes: function(s,pos,len) {
		while(len > 0) {
			var k = this.readBytes(s,pos,len);
			pos += k;
			len -= k;
		}
	}
	,read: function(nbytes) {
		var s = haxe.io.Bytes.alloc(nbytes);
		var p = 0;
		while(nbytes > 0) {
			var k = this.readBytes(s,p,nbytes);
			if(k == 0) throw haxe.io.Error.Blocked;
			p += k;
			nbytes -= k;
		}
		return s;
	}
	,readUInt16: function() {
		var ch1 = this.readByte();
		var ch2 = this.readByte();
		if(this.bigEndian) return ch2 | ch1 << 8; else return ch1 | ch2 << 8;
	}
	,readInt32: function() {
		var ch1 = this.readByte();
		var ch2 = this.readByte();
		var ch3 = this.readByte();
		var ch4 = this.readByte();
		if(this.bigEndian) return ch4 | ch3 << 8 | ch2 << 16 | ch1 << 24; else return ch1 | ch2 << 8 | ch3 << 16 | ch4 << 24;
	}
	,readString: function(len) {
		var b = haxe.io.Bytes.alloc(len);
		this.readFullBytes(b,0,len);
		return b.toString();
	}
	,__class__: haxe.io.Input
};
haxe.io.BytesInput = function(b,pos,len) {
	if(pos == null) pos = 0;
	if(len == null) len = b.length - pos;
	if(pos < 0 || len < 0 || pos + len > b.length) throw haxe.io.Error.OutsideBounds;
	this.b = b.b;
	this.pos = pos;
	this.len = len;
	this.totlen = len;
};
$hxClasses["haxe.io.BytesInput"] = haxe.io.BytesInput;
haxe.io.BytesInput.__name__ = true;
haxe.io.BytesInput.__super__ = haxe.io.Input;
haxe.io.BytesInput.prototype = $extend(haxe.io.Input.prototype,{
	readByte: function() {
		if(this.len == 0) throw new haxe.io.Eof();
		this.len--;
		return this.b[this.pos++];
	}
	,readBytes: function(buf,pos,len) {
		if(pos < 0 || len < 0 || pos + len > buf.length) throw haxe.io.Error.OutsideBounds;
		if(this.len == 0 && len > 0) throw new haxe.io.Eof();
		if(this.len < len) len = this.len;
		var b1 = this.b;
		var b2 = buf.b;
		var _g = 0;
		while(_g < len) {
			var i = _g++;
			b2[pos + i] = b1[this.pos + i];
		}
		this.pos += len;
		this.len -= len;
		return len;
	}
	,__class__: haxe.io.BytesInput
});
haxe.io.Eof = function() {
};
$hxClasses["haxe.io.Eof"] = haxe.io.Eof;
haxe.io.Eof.__name__ = true;
haxe.io.Eof.prototype = {
	toString: function() {
		return "Eof";
	}
	,__class__: haxe.io.Eof
};
haxe.io.Error = { __ename__ : true, __constructs__ : ["Blocked","Overflow","OutsideBounds","Custom"] };
haxe.io.Error.Blocked = ["Blocked",0];
haxe.io.Error.Blocked.toString = $estr;
haxe.io.Error.Blocked.__enum__ = haxe.io.Error;
haxe.io.Error.Overflow = ["Overflow",1];
haxe.io.Error.Overflow.toString = $estr;
haxe.io.Error.Overflow.__enum__ = haxe.io.Error;
haxe.io.Error.OutsideBounds = ["OutsideBounds",2];
haxe.io.Error.OutsideBounds.toString = $estr;
haxe.io.Error.OutsideBounds.__enum__ = haxe.io.Error;
haxe.io.Error.Custom = function(e) { var $x = ["Custom",3,e]; $x.__enum__ = haxe.io.Error; $x.toString = $estr; return $x; };
haxe.io.Error.__empty_constructs__ = [haxe.io.Error.Blocked,haxe.io.Error.Overflow,haxe.io.Error.OutsideBounds];
haxe.io.Path = function(path) {
	var c1 = path.lastIndexOf("/");
	var c2 = path.lastIndexOf("\\");
	if(c1 < c2) {
		this.dir = HxOverrides.substr(path,0,c2);
		path = HxOverrides.substr(path,c2 + 1,null);
		this.backslash = true;
	} else if(c2 < c1) {
		this.dir = HxOverrides.substr(path,0,c1);
		path = HxOverrides.substr(path,c1 + 1,null);
	} else this.dir = null;
	var cp = path.lastIndexOf(".");
	if(cp != -1) {
		this.ext = HxOverrides.substr(path,cp + 1,null);
		this.file = HxOverrides.substr(path,0,cp);
	} else {
		this.ext = null;
		this.file = path;
	}
};
$hxClasses["haxe.io.Path"] = haxe.io.Path;
haxe.io.Path.__name__ = true;
haxe.io.Path.directory = function(path) {
	var s = new haxe.io.Path(path);
	if(s.dir == null) return "";
	return s.dir;
};
haxe.io.Path.extension = function(path) {
	var s = new haxe.io.Path(path);
	if(s.ext == null) return "";
	return s.ext;
};
haxe.io.Path.join = function(paths) {
	var paths1 = paths.filter(function(s) {
		return s != null && s != "";
	});
	if(paths1.length == 0) return "";
	var path = paths1[0];
	var _g1 = 1;
	var _g = paths1.length;
	while(_g1 < _g) {
		var i = _g1++;
		path = haxe.io.Path.addTrailingSlash(path);
		path += paths1[i];
	}
	return haxe.io.Path.normalize(path);
};
haxe.io.Path.normalize = function(path) {
	var slash = "/";
	path = path.split("\\").join("/");
	if(path == null || path == slash) return slash;
	var target = [];
	var src;
	var parts;
	var token;
	src = path.split(slash);
	var _g1 = 0;
	var _g = src.length;
	while(_g1 < _g) {
		var i = _g1++;
		token = src[i];
		if(token == "..") target.pop(); else if(token != ".") target.push(token);
	}
	var tmp = target.join(slash);
	var regex = new EReg("([^:])/+","g");
	var result = regex.replace(tmp,"$1" + slash);
	return result;
};
haxe.io.Path.addTrailingSlash = function(path) {
	if(path.length == 0) return "/";
	var c1 = path.lastIndexOf("/");
	var c2 = path.lastIndexOf("\\");
	if(c1 < c2) {
		if(c2 != path.length - 1) return path + "\\"; else return path;
	} else if(c1 != path.length - 1) return path + "/"; else return path;
};
haxe.io.Path.prototype = {
	__class__: haxe.io.Path
};
js.Web = function() { };
$hxClasses["js.Web"] = js.Web;
js.Web.__name__ = true;
js.Web.getParams = function() {
	var result = new haxe.ds.StringMap();
	var paramObj = eval("\n\t\t\t(function() {\n\t\t\t    var match,\n\t\t\t        pl     = /\\+/g,  // Regex for replacing addition symbol with a space\n\t\t\t        search = /([^&=]+)=?([^&]*)/g,\n\t\t\t        decode = function (s) { return decodeURIComponent(s.replace(pl, ' ')); },\n\t\t\t        query  = window.location.search.substring(1);\n\n\t\t\t    var urlParams = {};\n\t\t\t    while (match = search.exec(query))\n\t\t\t       urlParams[decode(match[1])] = decode(match[2]);\n\t\t\t    return urlParams;\n\t\t\t})();\n\t\t");
	var _g = 0;
	var _g1 = Reflect.fields(paramObj);
	while(_g < _g1.length) {
		var f = _g1[_g];
		++_g;
		result.set(f,Reflect.field(paramObj,f));
	}
	return result;
};
js.html = {};
js.html._CanvasElement = {};
js.html._CanvasElement.CanvasUtil = function() { };
$hxClasses["js.html._CanvasElement.CanvasUtil"] = js.html._CanvasElement.CanvasUtil;
js.html._CanvasElement.CanvasUtil.__name__ = true;
js.html._CanvasElement.CanvasUtil.getContextWebGL = function(canvas,attribs) {
	var _g = 0;
	var _g1 = ["webgl","experimental-webgl"];
	while(_g < _g1.length) {
		var name = _g1[_g];
		++_g;
		var ctx = canvas.getContext(name,attribs);
		if(ctx != null) return ctx;
	}
	return null;
};
shaderblox.attributes = {};
shaderblox.attributes.Attribute = function() { };
$hxClasses["shaderblox.attributes.Attribute"] = shaderblox.attributes.Attribute;
shaderblox.attributes.Attribute.__name__ = true;
shaderblox.attributes.Attribute.prototype = {
	__class__: shaderblox.attributes.Attribute
};
shaderblox.attributes.FloatAttribute = function(name,location,nFloats) {
	if(nFloats == null) nFloats = 1;
	this.name = name;
	this.location = location;
	this.byteSize = nFloats * 4;
	this.itemCount = nFloats;
	this.type = 5126;
};
$hxClasses["shaderblox.attributes.FloatAttribute"] = shaderblox.attributes.FloatAttribute;
shaderblox.attributes.FloatAttribute.__name__ = true;
shaderblox.attributes.FloatAttribute.__super__ = shaderblox.attributes.Attribute;
shaderblox.attributes.FloatAttribute.prototype = $extend(shaderblox.attributes.Attribute.prototype,{
	toString: function() {
		return "[FloatAttribute itemCount=" + this.itemCount + " byteSize=" + this.byteSize + " location=" + this.location + " name=" + this.name + "]";
	}
	,__class__: shaderblox.attributes.FloatAttribute
});
shaderblox.helpers = {};
shaderblox.helpers.GLUniformLocationHelper = function() { };
$hxClasses["shaderblox.helpers.GLUniformLocationHelper"] = shaderblox.helpers.GLUniformLocationHelper;
shaderblox.helpers.GLUniformLocationHelper.__name__ = true;
shaderblox.helpers.GLUniformLocationHelper.isValid = function(u) {
	return u != null;
};
shaderblox.uniforms = {};
shaderblox.uniforms.IAppliable = function() { };
$hxClasses["shaderblox.uniforms.IAppliable"] = shaderblox.uniforms.IAppliable;
shaderblox.uniforms.IAppliable.__name__ = true;
shaderblox.uniforms.IAppliable.prototype = {
	__class__: shaderblox.uniforms.IAppliable
};
shaderblox.uniforms.UniformBase_Bool = function(name,index,data) {
	this.name = name;
	this.location = index;
	this.dirty = true;
	this.data = data;
	this.dirty = true;
};
$hxClasses["shaderblox.uniforms.UniformBase_Bool"] = shaderblox.uniforms.UniformBase_Bool;
shaderblox.uniforms.UniformBase_Bool.__name__ = true;
shaderblox.uniforms.UniformBase_Bool.prototype = {
	set: function(data) {
		this.dirty = true;
		this.dirty = true;
		return this.data = data;
	}
	,setDirty: function() {
		this.dirty = true;
	}
	,set_data: function(data) {
		this.dirty = true;
		return this.data = data;
	}
	,__class__: shaderblox.uniforms.UniformBase_Bool
};
shaderblox.uniforms.UBool = function(name,index,f) {
	if(f == null) f = false;
	shaderblox.uniforms.UniformBase_Bool.call(this,name,index,f);
};
$hxClasses["shaderblox.uniforms.UBool"] = shaderblox.uniforms.UBool;
shaderblox.uniforms.UBool.__name__ = true;
shaderblox.uniforms.UBool.__interfaces__ = [shaderblox.uniforms.IAppliable];
shaderblox.uniforms.UBool.__super__ = shaderblox.uniforms.UniformBase_Bool;
shaderblox.uniforms.UBool.prototype = $extend(shaderblox.uniforms.UniformBase_Bool.prototype,{
	apply: function() {
		snow.platform.web.render.opengl.GL.uniform1i(this.location,this.data?1:0);
		this.dirty = false;
	}
	,__class__: shaderblox.uniforms.UBool
});
shaderblox.uniforms.UniformBase_Float = function(name,index,data) {
	this.name = name;
	this.location = index;
	this.dirty = true;
	this.data = data;
	this.dirty = true;
};
$hxClasses["shaderblox.uniforms.UniformBase_Float"] = shaderblox.uniforms.UniformBase_Float;
shaderblox.uniforms.UniformBase_Float.__name__ = true;
shaderblox.uniforms.UniformBase_Float.prototype = {
	set: function(data) {
		this.dirty = true;
		this.dirty = true;
		return this.data = data;
	}
	,setDirty: function() {
		this.dirty = true;
	}
	,set_data: function(data) {
		this.dirty = true;
		return this.data = data;
	}
	,__class__: shaderblox.uniforms.UniformBase_Float
};
shaderblox.uniforms.UFloat = function(name,index,f) {
	if(f == null) f = 0.0;
	shaderblox.uniforms.UniformBase_Float.call(this,name,index,f);
};
$hxClasses["shaderblox.uniforms.UFloat"] = shaderblox.uniforms.UFloat;
shaderblox.uniforms.UFloat.__name__ = true;
shaderblox.uniforms.UFloat.__interfaces__ = [shaderblox.uniforms.IAppliable];
shaderblox.uniforms.UFloat.__super__ = shaderblox.uniforms.UniformBase_Float;
shaderblox.uniforms.UFloat.prototype = $extend(shaderblox.uniforms.UniformBase_Float.prototype,{
	apply: function() {
		snow.platform.web.render.opengl.GL.uniform1f(this.location,this.data);
		this.dirty = false;
	}
	,__class__: shaderblox.uniforms.UFloat
});
shaderblox.uniforms.UniformBase_js_html_webgl_Texture = function(name,index,data) {
	this.name = name;
	this.location = index;
	this.dirty = true;
	this.data = data;
	this.dirty = true;
};
$hxClasses["shaderblox.uniforms.UniformBase_js_html_webgl_Texture"] = shaderblox.uniforms.UniformBase_js_html_webgl_Texture;
shaderblox.uniforms.UniformBase_js_html_webgl_Texture.__name__ = true;
shaderblox.uniforms.UniformBase_js_html_webgl_Texture.prototype = {
	set: function(data) {
		this.dirty = true;
		this.dirty = true;
		return this.data = data;
	}
	,setDirty: function() {
		this.dirty = true;
	}
	,set_data: function(data) {
		this.dirty = true;
		return this.data = data;
	}
	,__class__: shaderblox.uniforms.UniformBase_js_html_webgl_Texture
};
shaderblox.uniforms.UTexture = function(name,index,cube) {
	if(cube == null) cube = false;
	this.cube = cube;
	if(cube) this.type = 34067; else this.type = 3553;
	shaderblox.uniforms.UniformBase_js_html_webgl_Texture.call(this,name,index,null);
};
$hxClasses["shaderblox.uniforms.UTexture"] = shaderblox.uniforms.UTexture;
shaderblox.uniforms.UTexture.__name__ = true;
shaderblox.uniforms.UTexture.__interfaces__ = [shaderblox.uniforms.IAppliable];
shaderblox.uniforms.UTexture.__super__ = shaderblox.uniforms.UniformBase_js_html_webgl_Texture;
shaderblox.uniforms.UTexture.prototype = $extend(shaderblox.uniforms.UniformBase_js_html_webgl_Texture.prototype,{
	apply: function() {
		if(this.data == null) return;
		var idx = 33984 + this.samplerIndex;
		if(shaderblox.uniforms.UTexture.lastActiveTexture != idx) snow.platform.web.render.opengl.GL.activeTexture(shaderblox.uniforms.UTexture.lastActiveTexture = idx);
		snow.platform.web.render.opengl.GL.uniform1i(this.location,this.samplerIndex);
		snow.platform.web.render.opengl.GL.bindTexture(this.type,this.data);
		this.dirty = false;
	}
	,__class__: shaderblox.uniforms.UTexture
});
shaderblox.uniforms.Vector2 = function(x,y) {
	if(y == null) y = 0;
	if(x == null) x = 0;
	this.x = x;
	this.y = y;
};
$hxClasses["shaderblox.uniforms.Vector2"] = shaderblox.uniforms.Vector2;
shaderblox.uniforms.Vector2.__name__ = true;
shaderblox.uniforms.Vector2.prototype = {
	set: function(x,y) {
		this.x = x;
		this.y = y;
	}
	,__class__: shaderblox.uniforms.Vector2
};
shaderblox.uniforms.UniformBase_shaderblox_uniforms_Vector2 = function(name,index,data) {
	this.name = name;
	this.location = index;
	this.dirty = true;
	this.data = data;
	this.dirty = true;
};
$hxClasses["shaderblox.uniforms.UniformBase_shaderblox_uniforms_Vector2"] = shaderblox.uniforms.UniformBase_shaderblox_uniforms_Vector2;
shaderblox.uniforms.UniformBase_shaderblox_uniforms_Vector2.__name__ = true;
shaderblox.uniforms.UniformBase_shaderblox_uniforms_Vector2.prototype = {
	set: function(data) {
		this.dirty = true;
		this.dirty = true;
		return this.data = data;
	}
	,setDirty: function() {
		this.dirty = true;
	}
	,set_data: function(data) {
		this.dirty = true;
		return this.data = data;
	}
	,__class__: shaderblox.uniforms.UniformBase_shaderblox_uniforms_Vector2
};
shaderblox.uniforms.UVec2 = function(name,index,x,y) {
	if(y == null) y = 0;
	if(x == null) x = 0;
	shaderblox.uniforms.UniformBase_shaderblox_uniforms_Vector2.call(this,name,index,new shaderblox.uniforms.Vector2(x,y));
};
$hxClasses["shaderblox.uniforms.UVec2"] = shaderblox.uniforms.UVec2;
shaderblox.uniforms.UVec2.__name__ = true;
shaderblox.uniforms.UVec2.__interfaces__ = [shaderblox.uniforms.IAppliable];
shaderblox.uniforms.UVec2.__super__ = shaderblox.uniforms.UniformBase_shaderblox_uniforms_Vector2;
shaderblox.uniforms.UVec2.prototype = $extend(shaderblox.uniforms.UniformBase_shaderblox_uniforms_Vector2.prototype,{
	apply: function() {
		snow.platform.web.render.opengl.GL.uniform2f(this.location,this.data.x,this.data.y);
		this.dirty = false;
	}
	,__class__: shaderblox.uniforms.UVec2
});
snow.AppFixedTimestep = function() {
	this.overflow = 0.0;
	this.frame_time = 0.0167;
	snow.App.call(this);
};
$hxClasses["snow.AppFixedTimestep"] = snow.AppFixedTimestep;
snow.AppFixedTimestep.__name__ = true;
snow.AppFixedTimestep.__super__ = snow.App;
snow.AppFixedTimestep.prototype = $extend(snow.App.prototype,{
	on_internal_init: function() {
		snow.App.prototype.on_internal_init.call(this);
		this.frame_time = 0.0166666666666666664;
		this.last_frame_start = snow.Snow.core.timestamp();
	}
	,on_internal_update: function() {
		this.cur_frame_start = snow.Snow.core.timestamp();
		this.delta_time = this.cur_frame_start - this.last_frame_start;
		this.delta_sim = this.delta_time * this.timescale;
		if(this.delta_sim > this.max_frame_time) this.delta_sim = this.max_frame_time;
		this.last_frame_start = this.cur_frame_start;
		this.overflow += this.delta_sim;
		while(this.overflow >= this.frame_time) {
			this.app.do_internal_update(this.frame_time * this.timescale);
			this.current_time += this.frame_time * this.timescale;
			this.overflow -= this.frame_time * this.timescale;
		}
		this.alpha = this.overflow / this.frame_time;
		if(this.render_rate != 0) {
			if(this.next_render < snow.Snow.core.timestamp()) {
				this.app.render();
				this.next_render += this.render_rate;
			}
		}
	}
	,__class__: snow.AppFixedTimestep
});
snow.utils = {};
snow.utils.AbstractClass = function() { };
$hxClasses["snow.utils.AbstractClass"] = snow.utils.AbstractClass;
snow.utils.AbstractClass.__name__ = true;
snow.CoreBinding = function() { };
$hxClasses["snow.CoreBinding"] = snow.CoreBinding;
snow.CoreBinding.__name__ = true;
snow.CoreBinding.__interfaces__ = [snow.utils.AbstractClass];
snow.CoreBinding.prototype = {
	init: function(_event_handler) {
		throw "abstract method, must override";
	}
	,shutdown: function() {
		throw "abstract method, must override";
	}
	,timestamp: function() {
		throw "abstract method, must override";
	}
	,app_path: function() {
		throw "abstract method, must override";
	}
	,pref_path: function(_package,_appname) {
		throw "abstract method, must override";
	}
	,__class__: snow.CoreBinding
};
snow.Log = function() { };
$hxClasses["snow.Log"] = snow.Log;
snow.Log.__name__ = true;
snow.Log._get_spacing = function(_file) {
	var _spaces = "";
	var _trace_length = _file.length + 4;
	var _diff = snow.Log._log_width - _trace_length;
	if(_diff > 0) {
		var _g = 0;
		while(_g < _diff) {
			var i = _g++;
			_spaces += " ";
		}
	}
	return _spaces;
};
snow.Snow = function() {
	this.is_ready = false;
	this.was_ready = false;
	this.has_shutdown = false;
	this.shutting_down = false;
	this.freeze = false;
	snow.Snow.core = new snow.platform.web.Core(this);
	snow.Snow.next_list = [];
};
$hxClasses["snow.Snow"] = snow.Snow;
snow.Snow.__name__ = true;
snow.Snow.load = function(library,method,args) {
	if(args == null) args = 0;
	return snow.utils.Libs.load(library,method,args);
};
snow.Snow.next = function(func) {
	if(func != null) snow.Snow.next_list.push(func);
};
snow.Snow.prototype = {
	init: function(_snow_config,_host) {
		this.snow_config = _snow_config;
		this.config = { has_window : true, runtime : { }, window : null, render : null, assets : [], web : { no_context_menu : true, true_fullscreen : false}, 'native' : { audio_buffer_length : 176400, audio_buffer_count : 4}};
		this.host = _host;
		this.host.app = this;
		snow.Snow.core.init($bind(this,this.on_event));
	}
	,shutdown: function() {
		this.shutting_down = true;
		this.host.ondestroy();
		this.io.destroy();
		this.audio.destroy();
		this.input.destroy();
		this.windowing.destroy();
		snow.Snow.core.shutdown();
		this.has_shutdown = true;
	}
	,get_time: function() {
		return snow.Snow.core.timestamp();
	}
	,on_snow_init: function() {
		this.host.on_internal_init();
	}
	,on_snow_ready: function() {
		if(this.was_ready) {
			haxe.Log.trace("     i / snow / " + "firing ready event repeatedly is not ideal...",{ fileName : "Snow.hx", lineNumber : 166, className : "snow.Snow", methodName : "on_snow_ready"});
			return;
		}
		this.io = new snow.io.IO(this);
		this.input = new snow.input.Input(this);
		this.audio = new snow.audio.Audio(this);
		this.assets = new snow.assets.Assets(this);
		this.windowing = new snow.window.Windowing(this);
		if(!this.snow_config.config_custom_assets) {
			this.assets.manifest_path = this.snow_config.config_assets_path;
			this.config.assets = this.default_asset_list();
			this.assets.add(this.config.assets);
		}
		if(!this.snow_config.config_custom_runtime) this.config.runtime = this.default_runtime_config();
		this.config.window = this.default_window_config();
		this.config.render = this.default_render_config();
		this.config = this.host.config(this.config);
		this.was_ready = true;
		if(this.config.has_window == true) {
			this.window = this.windowing.create(this.config.window);
			if(this.window.handle == null) throw "requested default window cannot be created. Cannot continue.";
		}
		this.is_ready = true;
		this.host.ready();
	}
	,do_internal_update: function(dt) {
		this.io.update();
		this.input.update();
		this.audio.update();
		this.host.update(dt);
	}
	,render: function() {
		this.windowing.update();
	}
	,on_snow_update: function() {
		if(!this.is_ready || this.freeze) return;
		snow.utils.Timer.update();
		if(snow.Snow.next_list.length > 0) {
			var _pre_next_length = snow.Snow.next_list.length;
			var _g1 = 0;
			var _g = snow.Snow.next_list.length;
			while(_g1 < _g) {
				var i = _g1++;
				snow.Snow.next_list[i]();
			}
			snow.Snow.next_list.splice(0,_pre_next_length);
		}
		this.host.on_internal_update();
	}
	,dispatch_system_event: function(_event) {
		this.on_event(_event);
	}
	,on_event: function(_event) {
		if(_event.type != 3 && _event.type != 0 && _event.type != 5 && _event.type != 6) null;
		if(_event.type != 3) null;
		if(this.is_ready) {
			this.io.on_event(_event);
			this.audio.on_event(_event);
			this.windowing.on_event(_event);
			this.input.on_event(_event);
			this.host.onevent(_event);
		}
		var _g = _event.type;
		switch(_g) {
		case 1:
			this.on_snow_init();
			break;
		case 2:
			this.on_snow_ready();
			break;
		case 3:
			this.on_snow_update();
			break;
		case 7:case 8:
			this.shutdown();
			break;
		case 4:
			haxe.Log.trace("     i / snow / " + "Goodbye.",{ fileName : "Snow.hx", lineNumber : 336, className : "snow.Snow", methodName : "on_event"});
			break;
		default:
		}
	}
	,set_freeze: function(_freeze) {
		this.freeze = _freeze;
		if(_freeze) this.audio.suspend(); else this.audio.resume();
		return this.freeze;
	}
	,default_runtime_config: function() {
		var config_data = this.assets.text(this.snow_config.config_runtime_path);
		if(config_data != null && config_data.text != null) try {
			var json = JSON.parse(config_data.text);
			return json;
		} catch( e ) {
			haxe.Log.trace("     i / snow / " + "config / failed / default runtime config failed to parse as JSON. cannot recover.",{ fileName : "Snow.hx", lineNumber : 383, className : "snow.Snow", methodName : "default_runtime_config"});
			throw e;
		}
		return { };
	}
	,default_asset_list: function() {
		var asset_list = [];
		var manifest_data = snow.platform.web.utils.ByteArray.readFile(this.assets.assets_root + this.assets.manifest_path,false);
		if(manifest_data != null && manifest_data.length != 0) {
			var _list = JSON.parse(manifest_data.toString());
			var _g = 0;
			while(_g < _list.length) {
				var asset = _list[_g];
				++_g;
				asset_list.push({ id : asset, path : haxe.io.Path.join([this.assets.assets_root,asset]), type : haxe.io.Path.extension(asset), ext : haxe.io.Path.extension(asset)});
			}
			null;
		} else haxe.Log.trace("     i / snow / " + "config / failed / default asset manifest not found, or length was zero",{ fileName : "Snow.hx", lineNumber : 418, className : "snow.Snow", methodName : "default_asset_list"});
		return asset_list;
	}
	,default_render_config: function() {
		return { depth : false, stencil : false, antialiasing : 0, red_bits : 8, green_bits : 8, blue_bits : 8, alpha_bits : 8, depth_bits : 0, stencil_bits : 0, opengl : { minor : 0, major : 0, profile : 0}};
	}
	,default_window_config: function() {
		return { fullscreen_desktop : true, fullscreen : false, resizable : true, borderless : false, x : 536805376, y : 536805376, width : 960, height : 640, title : "snow app"};
	}
	,get_uniqueid: function() {
		return haxe.crypto.Md5.encode(Std.string(snow.Snow.core.timestamp() * Math.random()));
	}
	,__class__: snow.Snow
};
snow.assets = {};
snow.assets.Asset = function(_assets,_info) {
	this.loaded = false;
	this.assets = _assets;
	this.info = _info;
	this.id = this.info.id;
};
$hxClasses["snow.assets.Asset"] = snow.assets.Asset;
snow.assets.Asset.__name__ = true;
snow.assets.Asset.prototype = {
	__class__: snow.assets.Asset
};
snow.assets.AssetAudio = function(_assets,_info,_format,_load) {
	if(_load == null) _load = true;
	this.load_full = true;
	snow.assets.Asset.call(this,_assets,_info);
	this.type = 3;
	this.format = _format;
	this.load_full = _load;
};
$hxClasses["snow.assets.AssetAudio"] = snow.assets.AssetAudio;
snow.assets.AssetAudio.__name__ = true;
snow.assets.AssetAudio.__super__ = snow.assets.Asset;
snow.assets.AssetAudio.prototype = $extend(snow.assets.Asset.prototype,{
	load: function(onload) {
		var _g = this;
		this.loaded = false;
		this.audio = null;
		this.assets.platform.audio_load_info(this.info.path,this.format,this.load_full,function(_audio) {
			_g.audio = _audio;
			_g.loaded = true;
			if(onload != null) snow.Snow.next(function() {
				onload(_g);
			});
		});
	}
	,__class__: snow.assets.AssetAudio
});
snow.assets.AssetBytes = function(_assets,_info,_async) {
	if(_async == null) _async = false;
	this.async = false;
	snow.assets.Asset.call(this,_assets,_info);
	this.type = 0;
	this.async = _async;
};
$hxClasses["snow.assets.AssetBytes"] = snow.assets.AssetBytes;
snow.assets.AssetBytes.__name__ = true;
snow.assets.AssetBytes.__super__ = snow.assets.Asset;
snow.assets.AssetBytes.prototype = $extend(snow.assets.Asset.prototype,{
	load: function(onload) {
		var _g = this;
		this.loaded = false;
		this.bytes = null;
		snow.platform.web.utils.ByteArray.readFile(this.info.path,this.async,function(result) {
			_g.bytes = result;
			_g.loaded = true;
			if(onload != null) snow.Snow.next(function() {
				onload(_g);
			});
		});
	}
	,load_from_bytes: function(_bytes,onload) {
		var _g = this;
		this.loaded = false;
		this.bytes = _bytes;
		this.loaded = true;
		if(onload != null) snow.Snow.next(function() {
			onload(_g);
		});
	}
	,__class__: snow.assets.AssetBytes
});
snow.assets.AssetImage = function(_assets,_info,_components) {
	if(_components == null) _components = 4;
	this.components = 4;
	snow.assets.Asset.call(this,_assets,_info);
	this.type = 2;
	this.components = _components;
};
$hxClasses["snow.assets.AssetImage"] = snow.assets.AssetImage;
snow.assets.AssetImage.__name__ = true;
snow.assets.AssetImage.__super__ = snow.assets.Asset;
snow.assets.AssetImage.prototype = $extend(snow.assets.Asset.prototype,{
	load: function(onload) {
		var _g = this;
		this.loaded = false;
		this.image = null;
		this.assets.platform.image_load_info(this.info.path,this.components,function(_image) {
			if(_image != null) {
				_g.image = _image;
				_g.loaded = true;
			}
			if(onload != null) snow.Snow.next(function() {
				onload(_g);
			});
		});
	}
	,load_from_bytes: function(bytes,onload) {
		var _g = this;
		this.loaded = false;
		this.image = null;
		this.image = this.assets.platform.image_info_from_bytes(this.info.path,bytes,this.components);
		if(onload != null) snow.Snow.next(function() {
			onload(_g);
		});
		this.loaded = true;
	}
	,load_from_pixels: function(_id,_width,_height,_pixels,onload) {
		var _g = this;
		this.loaded = false;
		this.image = null;
		this.image = { id : _id, width : _width, width_actual : _width, height : _height, height_actual : _height, bpp : 4, bpp_source : 4, data : _pixels};
		if(onload != null) snow.Snow.next(function() {
			onload(_g);
		});
		this.loaded = true;
	}
	,__class__: snow.assets.AssetImage
});
snow.assets.AssetSystemBinding = function() { };
$hxClasses["snow.assets.AssetSystemBinding"] = snow.assets.AssetSystemBinding;
snow.assets.AssetSystemBinding.__name__ = true;
snow.assets.AssetSystemBinding.__interfaces__ = [snow.utils.AbstractClass];
snow.assets.AssetSystemBinding.prototype = {
	exists: function(_id,_strict) {
		if(_strict == null) _strict = true;
		throw "abstract method, must override";
	}
	,image_load_info: function(_path,_components,_onload) {
		if(_components == null) _components = 4;
		throw "abstract method, must override";
	}
	,image_info_from_bytes: function(_path,_bytes,_components) {
		if(_components == null) _components = 4;
		throw "abstract method, must override";
	}
	,audio_load_info: function(_path,_format,_load,_onload) {
		if(_load == null) _load = true;
		throw "abstract method, must override";
	}
	,__class__: snow.assets.AssetSystemBinding
};
snow.assets.AssetText = function(_assets,_info,_async) {
	if(_async == null) _async = false;
	this.async = false;
	snow.assets.Asset.call(this,_assets,_info);
	this.type = 1;
	this.async = _async;
};
$hxClasses["snow.assets.AssetText"] = snow.assets.AssetText;
snow.assets.AssetText.__name__ = true;
snow.assets.AssetText.__super__ = snow.assets.Asset;
snow.assets.AssetText.prototype = $extend(snow.assets.Asset.prototype,{
	load: function(onload) {
		var _g = this;
		this.loaded = false;
		this.text = null;
		snow.platform.web.utils.ByteArray.readFile(this.info.path,this.async,function(result) {
			if(result != null) _g.text = result.toString();
			_g.loaded = true;
			if(onload != null) onload(_g);
		});
	}
	,load_from_string: function(_string,onload) {
		var _g = this;
		this.loaded = false;
		this.text = _string;
		if(onload != null) snow.Snow.next(function() {
			onload(_g);
		});
		this.loaded = true;
	}
	,__class__: snow.assets.AssetText
});
snow.assets.Assets = function(_lib) {
	this.strict = true;
	this.manifest_path = "manifest";
	this.assets_root = "";
	this.lib = _lib;
	this.list = new haxe.ds.StringMap();
	this.platform = new snow.platform.web.assets.AssetSystem(this);
};
$hxClasses["snow.assets.Assets"] = snow.assets.Assets;
snow.assets.Assets.__name__ = true;
snow.assets.Assets.prototype = {
	add: function(_list) {
		var _g = 0;
		while(_g < _list.length) {
			var _asset = _list[_g];
			++_g;
			var images = ["psd","bmp","tga","gif","jpg","png"];
			var sounds = ["pcm","ogg","wav"];
			if(Lambda.has(images,_asset.ext)) _asset.type = "image"; else if(Lambda.has(sounds,_asset.ext)) _asset.type = "sound";
			this.list.set(_asset.id,_asset);
		}
	}
	,get: function(_id) {
		return this.list.get(_id);
	}
	,listed: function(_id) {
		return this.list.exists(_id);
	}
	,exists: function(_id,_strict) {
		if(_strict == null) _strict = true;
		return this.platform.exists(_id,_strict);
	}
	,path: function(_id) {
		if(this.listed(_id)) return this.get(_id).path;
		return this.assets_root + _id;
	}
	,bytes: function(_id,options) {
		var _strict = this.strict;
		if(options != null && options.strict != null) _strict = options.strict;
		if(this.exists(_id,_strict)) {
			var info = this.get(_id);
			if(info == null) info = this.info_from_id(_id,"bytes");
			var asset = new snow.assets.AssetBytes(this,info,options != null?options.async:null);
			asset.load(options != null?options.onload:null);
			return asset;
		} else this.exists_error(_id);
		return null;
	}
	,text: function(_id,options) {
		var _strict = this.strict;
		if(options != null && options.strict != null) _strict = options.strict;
		if(this.exists(_id,_strict)) {
			var info = this.get(_id);
			if(info == null) info = this.info_from_id(_id,"text");
			var asset = new snow.assets.AssetText(this,info,options != null?options.async:null);
			asset.load(options != null?options.onload:null);
			return asset;
		} else this.exists_error(_id);
		return null;
	}
	,image: function(_id,options) {
		var _strict = this.strict;
		var from_bytes = options != null && options.bytes != null;
		if(options != null && options.strict != null) _strict = options.strict;
		if(this.exists(_id,_strict) || from_bytes) {
			if(options == null) options = { components : 4};
			var info = this.get(_id);
			if(info == null) info = this.info_from_id(_id,"image");
			var comp;
			if(options.components == null) comp = 4; else comp = options.components;
			var asset = new snow.assets.AssetImage(this,info,comp);
			if(!from_bytes) asset.load(options.onload); else asset.load_from_bytes(options.bytes,options.onload);
			return asset;
		} else this.exists_error(_id);
		return null;
	}
	,audio: function(_id,options) {
		var _strict = this.strict;
		if(options != null && options.strict != null) _strict = options.strict;
		if(this.exists(_id,_strict)) {
			var info = this.get(_id);
			if(info == null) info = this.info_from_id(_id,"audio");
			if(options == null) options = { type : info.ext, load : true}; else if(options.type == null || options.type == "") options.type = info.ext;
			var _type = 0;
			var _g = options.type;
			switch(_g) {
			case "wav":
				_type = 2;
				break;
			case "ogg":
				_type = 1;
				break;
			case "pcm":
				_type = 3;
				break;
			default:
				this.load_error(_id,"unrecognized audio format");
				return null;
			}
			var asset = new snow.assets.AssetAudio(this,info,_type,options.load);
			asset.load(options != null?options.onload:null);
			return asset;
		} else this.exists_error(_id);
		return null;
	}
	,info_from_id: function(_id,_type) {
		return { id : _id, path : _id, ext : haxe.io.Path.extension(_id), type : _type};
	}
	,exists_error: function(_id) {
		haxe.Log.trace("   i / assets / " + ("not found \"" + _id + "\""),{ fileName : "Assets.hx", lineNumber : 294, className : "snow.assets.Assets", methodName : "exists_error"});
	}
	,load_error: function(_id,reason) {
		if(reason == null) reason = "unknown";
		haxe.Log.trace("   i / assets / " + ("found \"" + _id + "\" but it failed to load (" + reason + ")"),{ fileName : "Assets.hx", lineNumber : 298, className : "snow.assets.Assets", methodName : "load_error"});
	}
	,__class__: snow.assets.Assets
};
snow.audio = {};
snow.audio.Audio = function(_lib) {
	this.active = false;
	this.lib = _lib;
	this.platform = new snow.platform.web.audio.howlerjs.AudioSystem(this,this.lib);
	this.platform.init();
	this.sound_list = new haxe.ds.StringMap();
	this.stream_list = new haxe.ds.StringMap();
	this.handles = new haxe.ds.ObjectMap();
	this.active = true;
};
$hxClasses["snow.audio.Audio"] = snow.audio.Audio;
snow.audio.Audio.__name__ = true;
snow.audio.Audio.prototype = {
	create: function(_id,_name,streaming) {
		if(streaming == null) streaming = false;
		if(_name == null) _name = "";
		var _g = this;
		if(_name == "") _name = this.lib.get_uniqueid();
		var sound = null;
		var _asset = this.lib.assets.audio(_id,{ load : !streaming, onload : function(asset) {
			if(asset != null && sound != null) {
				_g.handles.set(asset.audio.handle,sound);
				sound.set_info(asset.audio);
			}
		}});
		if(!streaming) sound = new snow.platform.web.audio.howlerjs.Sound(this,_name); else {
			var sound_stream = new snow.platform.web.audio.howlerjs.SoundStream(this,_name);
			this.stream_list.set(_name,sound_stream);
			sound = sound_stream;
		}
		this.sound_list.set(_name,sound);
		return sound;
	}
	,uncreate: function(_name) {
		var _sound = this.sound_list.get(_name);
		if(_sound == null) haxe.Log.trace("    i / audio / " + ("can't find sound, unable to uncreate, use create first: " + _name),{ fileName : "Audio.hx", lineNumber : 114, className : "snow.audio.Audio", methodName : "uncreate"});
		_sound.destroy();
	}
	,on: function(_name,_event,_handler) {
		var sound = this.get(_name);
		if(sound != null) sound.on(_event,_handler);
	}
	,off: function(_name,_event,_handler) {
		var sound = this.get(_name);
		if(sound != null) sound.off(_event,_handler);
	}
	,get: function(_name) {
		var _sound = this.sound_list.get(_name);
		if(_sound == null) haxe.Log.trace("    i / audio / " + ("sound not found, use create first: " + _name),{ fileName : "Audio.hx", lineNumber : 144, className : "snow.audio.Audio", methodName : "get"});
		return _sound;
	}
	,volume: function(_name,_volume) {
		var sound = this.get(_name);
		if(sound != null) {
			if(_volume != null) return sound.set_volume(_volume); else return sound.get_volume();
		}
		return 0;
	}
	,pan: function(_name,_pan) {
		var sound = this.get(_name);
		if(sound != null) {
			if(_pan != null) return sound.set_pan(_pan); else return sound.get_pan();
		}
		return 0;
	}
	,pitch: function(_name,_pitch) {
		var sound = this.get(_name);
		if(sound != null) {
			if(_pitch != null) return sound.set_pitch(_pitch); else return sound.get_pitch();
		}
		return 0;
	}
	,position: function(_name,_position) {
		var sound = this.get(_name);
		if(sound != null) {
			if(_position != null) return sound.set_position(_position); else return sound.get_position();
		}
		return 0;
	}
	,duration: function(_name) {
		var sound = this.get(_name);
		if(sound != null) return sound.get_duration();
		return 0;
	}
	,play: function(_name) {
		if(!this.active) return;
		var sound = this.get(_name);
		if(sound != null) sound.play();
	}
	,loop: function(_name) {
		if(!this.active) return;
		var sound = this.get(_name);
		if(sound != null) sound.loop();
	}
	,pause: function(_name) {
		if(!this.active) return;
		var sound = this.get(_name);
		if(sound != null) sound.pause();
	}
	,stop: function(_name) {
		if(!this.active) return;
		var sound = this.get(_name);
		if(sound != null) sound.stop();
	}
	,toggle: function(_name) {
		if(!this.active) return;
		var sound = this.get(_name);
		if(sound != null) sound.toggle();
	}
	,kill: function(_sound) {
		this.handles.remove(_sound.get_info().handle);
		this.sound_list.remove(_sound.name);
		this.stream_list.remove(_sound.name);
	}
	,suspend: function() {
		if(!this.active) return;
		haxe.Log.trace("    i / audio / " + "suspending sound context",{ fileName : "Audio.hx", lineNumber : 300, className : "snow.audio.Audio", methodName : "suspend"});
		this.active = false;
		var $it0 = this.stream_list.iterator();
		while( $it0.hasNext() ) {
			var sound = $it0.next();
			sound.internal_pause();
		}
		this.platform.suspend();
	}
	,resume: function() {
		if(this.active) return;
		haxe.Log.trace("    i / audio / " + "resuming sound context",{ fileName : "Audio.hx", lineNumber : 318, className : "snow.audio.Audio", methodName : "resume"});
		this.active = true;
		this.platform.resume();
		var $it0 = this.stream_list.iterator();
		while( $it0.hasNext() ) {
			var sound = $it0.next();
			sound.internal_play();
		}
	}
	,on_event: function(_event) {
		if(_event.type == 10) this.suspend(); else if(_event.type == 12) this.resume();
	}
	,destroy: function() {
		this.active = false;
		var $it0 = this.sound_list.iterator();
		while( $it0.hasNext() ) {
			var sound = $it0.next();
			sound.destroy();
		}
		this.platform.destroy();
	}
	,update: function() {
		if(!this.active) return;
		var $it0 = this.sound_list.iterator();
		while( $it0.hasNext() ) {
			var _sound = $it0.next();
			if(_sound.playing) _sound.internal_update();
		}
		this.platform.process();
	}
	,__class__: snow.audio.Audio
};
snow.audio.AudioSystemBinding = function() { };
$hxClasses["snow.audio.AudioSystemBinding"] = snow.audio.AudioSystemBinding;
snow.audio.AudioSystemBinding.__name__ = true;
snow.audio.AudioSystemBinding.__interfaces__ = [snow.utils.AbstractClass];
snow.audio.AudioSystemBinding.prototype = {
	init: function() {
		throw "abstract method, must override";
	}
	,process: function() {
		throw "abstract method, must override";
	}
	,destroy: function() {
		throw "abstract method, must override";
	}
	,suspend: function() {
		throw "abstract method, must override";
	}
	,resume: function() {
		throw "abstract method, must override";
	}
	,__class__: snow.audio.AudioSystemBinding
};
snow.audio.SoundBinding = function(_manager,_name) {
	this.duration = 0.0;
	this.position = 0.0;
	this.looping = false;
	this.pan = 0.0;
	this.volume = 1.0;
	this.pitch = 1.0;
	this.is_stream = false;
	this.loaded = false;
	this.paused = false;
	this.playing = false;
	this.name = "";
	this.name = _name;
	this.manager = _manager;
	this.onload_list = [];
	this.onend_list = [];
};
$hxClasses["snow.audio.SoundBinding"] = snow.audio.SoundBinding;
snow.audio.SoundBinding.__name__ = true;
snow.audio.SoundBinding.prototype = {
	emit: function(_event) {
		switch(_event) {
		case "end":
			this.do_onend();
			break;
		case "load":
			this.do_onload();
			break;
		default:
			haxe.Log.trace("    i / sound / " + ("no event {" + _event + "}"),{ fileName : "Sound.hx", lineNumber : 80, className : "snow.audio.SoundBinding", methodName : "emit"});
		}
	}
	,on: function(_event,_handler) {
		switch(_event) {
		case "end":
			this.onend_list.push(_handler);
			break;
		case "load":
			this.add_onload(_handler);
			break;
		default:
			haxe.Log.trace("    i / sound / " + ("no event {" + _event + "}"),{ fileName : "Sound.hx", lineNumber : 91, className : "snow.audio.SoundBinding", methodName : "on"});
		}
	}
	,off: function(_event,_handler) {
		switch(_event) {
		case "end":
			HxOverrides.remove(this.onend_list,_handler);
			break;
		case "load":
			HxOverrides.remove(this.onload_list,_handler);
			break;
		default:
			haxe.Log.trace("    i / sound / " + ("no event {" + _event + "}"),{ fileName : "Sound.hx", lineNumber : 102, className : "snow.audio.SoundBinding", methodName : "off"});
		}
	}
	,play: function() {
	}
	,loop: function() {
	}
	,stop: function() {
	}
	,pause: function() {
	}
	,destroy: function() {
	}
	,internal_update: function() {
	}
	,internal_play: function() {
	}
	,internal_loop: function() {
	}
	,internal_stop: function() {
	}
	,internal_pause: function() {
	}
	,toggle: function() {
		this.playing = !this.playing;
		if(this.playing) {
			if(this.get_looping()) this.loop(); else this.play();
		} else this.pause();
	}
	,get_info: function() {
		return this.info;
	}
	,set_info: function(_info) {
		return this.info = _info;
	}
	,get_pan: function() {
		return this.pan;
	}
	,get_pitch: function() {
		return this.pitch;
	}
	,get_volume: function() {
		return this.volume;
	}
	,get_looping: function() {
		return this.looping;
	}
	,get_position: function() {
		return this.position;
	}
	,get_duration: function() {
		return 0;
	}
	,set_pan: function(_pan) {
		return this.pan = _pan;
	}
	,set_pitch: function(_pitch) {
		return this.pitch = _pitch;
	}
	,set_volume: function(_volume) {
		return this.volume = _volume;
	}
	,set_position: function(_position) {
		return this.position = _position;
	}
	,set_looping: function(_looping) {
		return this.looping = _looping;
	}
	,do_onload: function() {
		var _g = 0;
		var _g1 = this.onload_list;
		while(_g < _g1.length) {
			var _f = _g1[_g];
			++_g;
			_f(this);
		}
		this.onload_list = null;
		this.onload_list = [];
	}
	,do_onend: function() {
		var _g = 0;
		var _g1 = this.onend_list;
		while(_g < _g1.length) {
			var _f = _g1[_g];
			++_g;
			_f(this);
		}
	}
	,add_onload: function(_onload) {
		if(this.loaded) _onload(this); else this.onload_list.push(_onload);
		return _onload;
	}
	,__class__: snow.audio.SoundBinding
};
snow.input = {};
snow.input.Input = function(_lib) {
	this.lib = _lib;
	this.platform = new snow.platform.web.input.InputSystem(this,this.lib);
	this.platform.init();
	this.key_code_pressed = new haxe.ds.IntMap();
	this.key_code_down = new haxe.ds.IntMap();
	this.key_code_released = new haxe.ds.IntMap();
	this.scan_code_pressed = new haxe.ds.IntMap();
	this.scan_code_down = new haxe.ds.IntMap();
	this.scan_code_released = new haxe.ds.IntMap();
	this.mouse_button_pressed = new haxe.ds.IntMap();
	this.mouse_button_down = new haxe.ds.IntMap();
	this.mouse_button_released = new haxe.ds.IntMap();
	this.gamepad_button_pressed = new haxe.ds.IntMap();
	this.gamepad_button_down = new haxe.ds.IntMap();
	this.gamepad_button_released = new haxe.ds.IntMap();
	this.gamepad_axis_values = new haxe.ds.IntMap();
};
$hxClasses["snow.input.Input"] = snow.input.Input;
snow.input.Input.__name__ = true;
snow.input.Input.prototype = {
	keypressed: function(_code) {
		return this.key_code_pressed.exists(_code);
	}
	,keyreleased: function(_code) {
		return this.key_code_released.exists(_code);
	}
	,keydown: function(_code) {
		return this.key_code_down.exists(_code);
	}
	,scanpressed: function(_code) {
		return this.scan_code_pressed.exists(_code);
	}
	,scanreleased: function(_code) {
		return this.scan_code_released.exists(_code);
	}
	,scandown: function(_code) {
		return this.scan_code_down.exists(_code);
	}
	,mousepressed: function(_button) {
		return this.mouse_button_pressed.exists(_button);
	}
	,mousereleased: function(_button) {
		return this.mouse_button_released.exists(_button);
	}
	,mousedown: function(_button) {
		return this.mouse_button_down.exists(_button);
	}
	,gamepadpressed: function(_gamepad,_button) {
		var _gamepad_state = this.gamepad_button_pressed.get(_gamepad);
		if(_gamepad_state != null) return _gamepad_state.exists(_button); else return false;
	}
	,gamepadreleased: function(_gamepad,_button) {
		var _gamepad_state = this.gamepad_button_released.get(_gamepad);
		if(_gamepad_state != null) return _gamepad_state.exists(_button); else return false;
	}
	,gamepaddown: function(_gamepad,_button) {
		var _gamepad_state = this.gamepad_button_down.get(_gamepad);
		if(_gamepad_state != null) return _gamepad_state.exists(_button); else return false;
	}
	,gamepadaxis: function(_gamepad,_axis) {
		var _gamepad_state = this.gamepad_axis_values.get(_gamepad);
		if(_gamepad_state != null) {
			if(_gamepad_state.exists(_axis)) return _gamepad_state.get(_axis);
		}
		return 0;
	}
	,dispatch_key_down_event: function(keycode,scancode,repeat,mod,timestamp,window_id) {
		if(!repeat) {
			this.key_code_pressed.set(keycode,false);
			this.key_code_down.set(keycode,true);
			this.scan_code_pressed.set(scancode,false);
			this.scan_code_down.set(scancode,true);
		}
		this.lib.host.onkeydown(keycode,scancode,repeat,mod,timestamp,window_id);
	}
	,dispatch_key_up_event: function(keycode,scancode,repeat,mod,timestamp,window_id) {
		this.key_code_released.set(keycode,false);
		this.key_code_down.remove(keycode);
		this.scan_code_released.set(scancode,false);
		this.scan_code_down.remove(scancode);
		this.lib.host.onkeyup(keycode,scancode,repeat,mod,timestamp,window_id);
	}
	,dispatch_text_event: function(text,start,length,type,timestamp,window_id) {
		this.lib.host.ontextinput(text,start,length,type,timestamp,window_id);
	}
	,dispatch_mouse_move_event: function(x,y,xrel,yrel,timestamp,window_id) {
		this.lib.host.onmousemove(x,y,xrel,yrel,timestamp,window_id);
	}
	,dispatch_mouse_down_event: function(x,y,button,timestamp,window_id) {
		this.mouse_button_pressed.set(button,false);
		this.mouse_button_down.set(button,true);
		this.lib.host.onmousedown(x,y,button,timestamp,window_id);
	}
	,dispatch_mouse_up_event: function(x,y,button,timestamp,window_id) {
		this.mouse_button_released.set(button,false);
		this.mouse_button_down.remove(button);
		this.lib.host.onmouseup(x,y,button,timestamp,window_id);
	}
	,dispatch_mouse_wheel_event: function(x,y,timestamp,window_id) {
		this.lib.host.onmousewheel(x,y,timestamp,window_id);
	}
	,dispatch_touch_down_event: function(x,y,touch_id,timestamp) {
		this.lib.host.ontouchdown(x,y,touch_id,timestamp);
	}
	,dispatch_touch_up_event: function(x,y,touch_id,timestamp) {
		this.lib.host.ontouchup(x,y,touch_id,timestamp);
	}
	,dispatch_touch_move_event: function(x,y,dx,dy,touch_id,timestamp) {
		this.lib.host.ontouchmove(x,y,dx,dy,touch_id,timestamp);
	}
	,dispatch_gamepad_axis_event: function(gamepad,axis,value,timestamp) {
		if(!this.gamepad_axis_values.exists(gamepad)) {
			var value1 = new haxe.ds.IntMap();
			this.gamepad_axis_values.set(gamepad,value1);
		}
		var this1 = this.gamepad_axis_values.get(gamepad);
		this1.set(axis,value);
		this.lib.host.ongamepadaxis(gamepad,axis,value,timestamp);
	}
	,dispatch_gamepad_button_down_event: function(gamepad,button,value,timestamp) {
		if(!this.gamepad_button_pressed.exists(gamepad)) {
			var value1 = new haxe.ds.IntMap();
			this.gamepad_button_pressed.set(gamepad,value1);
		}
		if(!this.gamepad_button_down.exists(gamepad)) {
			var value2 = new haxe.ds.IntMap();
			this.gamepad_button_down.set(gamepad,value2);
		}
		var this1 = this.gamepad_button_pressed.get(gamepad);
		this1.set(button,false);
		var this2 = this.gamepad_button_down.get(gamepad);
		this2.set(button,true);
		this.lib.host.ongamepaddown(gamepad,button,value,timestamp);
	}
	,dispatch_gamepad_button_up_event: function(gamepad,button,value,timestamp) {
		if(!this.gamepad_button_released.exists(gamepad)) {
			var value1 = new haxe.ds.IntMap();
			this.gamepad_button_released.set(gamepad,value1);
		}
		if(!this.gamepad_button_down.exists(gamepad)) {
			var value2 = new haxe.ds.IntMap();
			this.gamepad_button_down.set(gamepad,value2);
		}
		var this1 = this.gamepad_button_released.get(gamepad);
		this1.set(button,false);
		var this2 = this.gamepad_button_down.get(gamepad);
		this2.remove(button);
		this.lib.host.ongamepadup(gamepad,button,value,timestamp);
	}
	,dispatch_gamepad_device_event: function(gamepad,type,timestamp) {
		this.lib.host.ongamepaddevice(gamepad,type,timestamp);
	}
	,listen: function(_window) {
		this.platform.listen(_window);
	}
	,unlisten: function(_window) {
		this.platform.unlisten(_window);
	}
	,on_event: function(_event) {
		if(_event.type == 6) this.platform.on_event(_event.input);
	}
	,on_gamepad_added: function(_event) {
		this.platform.gamepad_add(_event.which);
	}
	,on_gamepad_removed: function(_event) {
		this.platform.gamepad_remove(_event.which);
	}
	,update: function() {
		this.platform.process();
		this._update_keystate();
		this._update_gamepadstate();
		this._update_mousestate();
	}
	,destroy: function() {
		this.platform.destroy();
	}
	,_update_mousestate: function() {
		var $it0 = this.mouse_button_pressed.keys();
		while( $it0.hasNext() ) {
			var _code = $it0.next();
			if(this.mouse_button_pressed.get(_code)) this.mouse_button_pressed.remove(_code); else this.mouse_button_pressed.set(_code,true);
		}
		var $it1 = this.mouse_button_released.keys();
		while( $it1.hasNext() ) {
			var _code1 = $it1.next();
			if(this.mouse_button_released.get(_code1)) this.mouse_button_released.remove(_code1); else this.mouse_button_released.set(_code1,true);
		}
	}
	,_update_gamepadstate: function() {
		var $it0 = this.gamepad_button_pressed.iterator();
		while( $it0.hasNext() ) {
			var _gamepad_pressed = $it0.next();
			var $it1 = _gamepad_pressed.keys();
			while( $it1.hasNext() ) {
				var _button = $it1.next();
				if(_gamepad_pressed.get(_button)) _gamepad_pressed.remove(_button); else _gamepad_pressed.set(_button,true);
			}
		}
		var $it2 = this.gamepad_button_released.iterator();
		while( $it2.hasNext() ) {
			var _gamepad_released = $it2.next();
			var $it3 = _gamepad_released.keys();
			while( $it3.hasNext() ) {
				var _button1 = $it3.next();
				if(_gamepad_released.get(_button1)) _gamepad_released.remove(_button1); else _gamepad_released.set(_button1,true);
			}
		}
	}
	,_update_keystate: function() {
		var $it0 = this.key_code_pressed.keys();
		while( $it0.hasNext() ) {
			var _code = $it0.next();
			if(this.key_code_pressed.get(_code)) this.key_code_pressed.remove(_code); else this.key_code_pressed.set(_code,true);
		}
		var $it1 = this.key_code_released.keys();
		while( $it1.hasNext() ) {
			var _code1 = $it1.next();
			if(this.key_code_released.get(_code1)) this.key_code_released.remove(_code1); else this.key_code_released.set(_code1,true);
		}
		var $it2 = this.scan_code_pressed.keys();
		while( $it2.hasNext() ) {
			var _code2 = $it2.next();
			if(this.scan_code_pressed.get(_code2)) this.scan_code_pressed.remove(_code2); else this.scan_code_pressed.set(_code2,true);
		}
		var $it3 = this.scan_code_released.keys();
		while( $it3.hasNext() ) {
			var _code3 = $it3.next();
			if(this.scan_code_released.get(_code3)) this.scan_code_released.remove(_code3); else this.scan_code_released.set(_code3,true);
		}
	}
	,__class__: snow.input.Input
};
snow.input.InputSystemBinding = function() { };
$hxClasses["snow.input.InputSystemBinding"] = snow.input.InputSystemBinding;
snow.input.InputSystemBinding.__name__ = true;
snow.input.InputSystemBinding.__interfaces__ = [snow.utils.AbstractClass];
snow.input.InputSystemBinding.prototype = {
	init: function() {
		throw "abstract method, must override";
	}
	,process: function() {
		throw "abstract method, must override";
	}
	,destroy: function() {
		throw "abstract method, must override";
	}
	,on_event: function(_event) {
		throw "abstract method, must override";
	}
	,text_input_start: function() {
		throw "abstract method, must override";
	}
	,text_input_stop: function() {
		throw "abstract method, must override";
	}
	,text_input_rect: function(x,y,w,h) {
		throw "abstract method, must override";
	}
	,gamepad_add: function(id) {
		throw "abstract method, must override";
	}
	,gamepad_remove: function(id) {
		throw "abstract method, must override";
	}
	,listen: function(window) {
		throw "abstract method, must override";
	}
	,unlisten: function(window) {
		throw "abstract method, must override";
	}
	,__class__: snow.input.InputSystemBinding
};
snow.input.Scancodes = function() { };
$hxClasses["snow.input.Scancodes"] = snow.input.Scancodes;
snow.input.Scancodes.__name__ = true;
snow.input.Scancodes.$name = function(scancode) {
	var res = null;
	if(scancode >= 0 && scancode < snow.input.Scancodes.scancode_names.length) res = snow.input.Scancodes.scancode_names[scancode];
	if(res != null) return res; else return "";
};
snow.input.Keycodes = function() { };
$hxClasses["snow.input.Keycodes"] = snow.input.Keycodes;
snow.input.Keycodes.__name__ = true;
snow.input.Keycodes.from_scan = function(scancode) {
	return scancode | snow.input.Scancodes.MASK;
};
snow.input.Keycodes.to_scan = function(keycode) {
	if((keycode & snow.input.Scancodes.MASK) != 0) return keycode & ~snow.input.Scancodes.MASK;
	switch(keycode) {
	case snow.input.Keycodes.enter:
		return snow.input.Scancodes.enter;
	case snow.input.Keycodes.escape:
		return snow.input.Scancodes.escape;
	case snow.input.Keycodes.backspace:
		return snow.input.Scancodes.backspace;
	case snow.input.Keycodes.tab:
		return snow.input.Scancodes.tab;
	case snow.input.Keycodes.space:
		return snow.input.Scancodes.space;
	case snow.input.Keycodes.slash:
		return snow.input.Scancodes.slash;
	case snow.input.Keycodes.key_0:
		return snow.input.Scancodes.key_0;
	case snow.input.Keycodes.key_1:
		return snow.input.Scancodes.key_1;
	case snow.input.Keycodes.key_2:
		return snow.input.Scancodes.key_2;
	case snow.input.Keycodes.key_3:
		return snow.input.Scancodes.key_3;
	case snow.input.Keycodes.key_4:
		return snow.input.Scancodes.key_4;
	case snow.input.Keycodes.key_5:
		return snow.input.Scancodes.key_5;
	case snow.input.Keycodes.key_6:
		return snow.input.Scancodes.key_6;
	case snow.input.Keycodes.key_7:
		return snow.input.Scancodes.key_7;
	case snow.input.Keycodes.key_8:
		return snow.input.Scancodes.key_8;
	case snow.input.Keycodes.key_9:
		return snow.input.Scancodes.key_9;
	case snow.input.Keycodes.semicolon:
		return snow.input.Scancodes.semicolon;
	case snow.input.Keycodes.equals:
		return snow.input.Scancodes.equals;
	case snow.input.Keycodes.leftbracket:
		return snow.input.Scancodes.leftbracket;
	case snow.input.Keycodes.backslash:
		return snow.input.Scancodes.backslash;
	case snow.input.Keycodes.rightbracket:
		return snow.input.Scancodes.rightbracket;
	case snow.input.Keycodes.backquote:
		return snow.input.Scancodes.grave;
	case snow.input.Keycodes.key_a:
		return snow.input.Scancodes.key_a;
	case snow.input.Keycodes.key_b:
		return snow.input.Scancodes.key_b;
	case snow.input.Keycodes.key_c:
		return snow.input.Scancodes.key_c;
	case snow.input.Keycodes.key_d:
		return snow.input.Scancodes.key_d;
	case snow.input.Keycodes.key_e:
		return snow.input.Scancodes.key_e;
	case snow.input.Keycodes.key_f:
		return snow.input.Scancodes.key_f;
	case snow.input.Keycodes.key_g:
		return snow.input.Scancodes.key_g;
	case snow.input.Keycodes.key_h:
		return snow.input.Scancodes.key_h;
	case snow.input.Keycodes.key_i:
		return snow.input.Scancodes.key_i;
	case snow.input.Keycodes.key_j:
		return snow.input.Scancodes.key_j;
	case snow.input.Keycodes.key_k:
		return snow.input.Scancodes.key_k;
	case snow.input.Keycodes.key_l:
		return snow.input.Scancodes.key_l;
	case snow.input.Keycodes.key_m:
		return snow.input.Scancodes.key_m;
	case snow.input.Keycodes.key_n:
		return snow.input.Scancodes.key_n;
	case snow.input.Keycodes.key_o:
		return snow.input.Scancodes.key_o;
	case snow.input.Keycodes.key_p:
		return snow.input.Scancodes.key_p;
	case snow.input.Keycodes.key_q:
		return snow.input.Scancodes.key_q;
	case snow.input.Keycodes.key_r:
		return snow.input.Scancodes.key_r;
	case snow.input.Keycodes.key_s:
		return snow.input.Scancodes.key_s;
	case snow.input.Keycodes.key_t:
		return snow.input.Scancodes.key_t;
	case snow.input.Keycodes.key_u:
		return snow.input.Scancodes.key_u;
	case snow.input.Keycodes.key_v:
		return snow.input.Scancodes.key_v;
	case snow.input.Keycodes.key_w:
		return snow.input.Scancodes.key_w;
	case snow.input.Keycodes.key_x:
		return snow.input.Scancodes.key_x;
	case snow.input.Keycodes.key_y:
		return snow.input.Scancodes.key_y;
	case snow.input.Keycodes.key_z:
		return snow.input.Scancodes.key_z;
	}
	return snow.input.Scancodes.unknown;
};
snow.input.Keycodes.$name = function(keycode) {
	if((keycode & snow.input.Scancodes.MASK) != 0) return snow.input.Scancodes.$name(keycode & ~snow.input.Scancodes.MASK);
	switch(keycode) {
	case snow.input.Keycodes.enter:
		return snow.input.Scancodes.$name(snow.input.Scancodes.enter);
	case snow.input.Keycodes.escape:
		return snow.input.Scancodes.$name(snow.input.Scancodes.escape);
	case snow.input.Keycodes.backspace:
		return snow.input.Scancodes.$name(snow.input.Scancodes.backspace);
	case snow.input.Keycodes.tab:
		return snow.input.Scancodes.$name(snow.input.Scancodes.tab);
	case snow.input.Keycodes.space:
		return snow.input.Scancodes.$name(snow.input.Scancodes.space);
	case snow.input.Keycodes["delete"]:
		return snow.input.Scancodes.$name(snow.input.Scancodes["delete"]);
	default:
		var decoder = new haxe.Utf8();
		decoder.__b += String.fromCharCode(keycode);
		return decoder.__b;
	}
};
snow.io = {};
snow.io.IO = function(_lib) {
	this.lib = _lib;
	this.platform = new snow.platform.web.io.IOSystem(this,this.lib);
	this.platform.init();
};
$hxClasses["snow.io.IO"] = snow.io.IO;
snow.io.IO.__name__ = true;
snow.io.IO.prototype = {
	url_open: function(_url) {
		this.platform.url_open(_url);
	}
	,on_event: function(_event) {
		this.platform.on_event(_event);
	}
	,update: function() {
		this.platform.process();
	}
	,destroy: function() {
		this.platform.destroy();
	}
	,__class__: snow.io.IO
};
snow.io.IOSystemBinding = function() { };
$hxClasses["snow.io.IOSystemBinding"] = snow.io.IOSystemBinding;
snow.io.IOSystemBinding.__name__ = true;
snow.io.IOSystemBinding.__interfaces__ = [snow.utils.AbstractClass];
snow.io.IOSystemBinding.prototype = {
	init: function() {
		throw "abstract method, must override";
	}
	,process: function() {
		throw "abstract method, must override";
	}
	,destroy: function() {
		throw "abstract method, must override";
	}
	,on_event: function(_event) {
		throw "abstract method, must override";
	}
	,url_open: function(_url) {
		throw "abstract method, must override";
	}
	,__class__: snow.io.IOSystemBinding
};
snow.platform = {};
snow.platform.web = {};
snow.platform.web.Core = function(_app) {
	this._time_now = 0.0;
	this._lf_timestamp = 0.016;
	this.start_timestamp = 0.0;
	this.app = _app;
	this.start_timestamp = this.timestamp();
};
$hxClasses["snow.platform.web.Core"] = snow.platform.web.Core;
snow.platform.web.Core.__name__ = true;
snow.platform.web.Core.__super__ = snow.CoreBinding;
snow.platform.web.Core.prototype = $extend(snow.CoreBinding.prototype,{
	init: function(_event_handler) {
		this.app.dispatch_system_event({ type : 1});
		this.app.dispatch_system_event({ type : 2});
		if(this.app.snow_config.has_loop) this.request_update();
	}
	,shutdown: function() {
	}
	,timestamp: function() {
		var now;
		if(window.performance != null) now = window.performance.now() / 1000.0; else now = haxe.Timer.stamp();
		return now - this.start_timestamp;
	}
	,app_path: function() {
		return haxe.io.Path.directory(window.location.href) + "/";
	}
	,pref_path: function(_name,_package) {
		return "./";
	}
	,request_update: function() {
		var _g = this;
		if(($_=window,$bind($_,$_.requestAnimationFrame)) != null) window.requestAnimationFrame($bind(this,this.snow_core_loop)); else {
			haxe.Log.trace("     i / core / " + ("warning : requestAnimationFrame not found, falling back to render_rate! render_rate:" + this.app.host.render_rate),{ fileName : "Core.hx", lineNumber : 87, className : "snow.platform.web.Core", methodName : "request_update"});
			window.setTimeout(function() {
				var _now = _g.timestamp();
				_g._time_now += _now - _g._lf_timestamp;
				_g.snow_core_loop(_g._time_now * 1000.0);
				_g._lf_timestamp = _now;
			},this.app.host.render_rate * 1000.0 | 0);
		}
	}
	,snow_core_loop: function(_t) {
		if(_t == null) _t = 0.016;
		this.update();
		this.app.dispatch_system_event({ type : 3});
		this.request_update();
		return true;
	}
	,update: function() {
	}
	,__class__: snow.platform.web.Core
});
snow.platform.web.assets = {};
snow.platform.web.assets.AssetSystem = function(_manager) {
	this.manager = _manager;
};
$hxClasses["snow.platform.web.assets.AssetSystem"] = snow.platform.web.assets.AssetSystem;
snow.platform.web.assets.AssetSystem.__name__ = true;
snow.platform.web.assets.AssetSystem.__super__ = snow.assets.AssetSystemBinding;
snow.platform.web.assets.AssetSystem.prototype = $extend(snow.assets.AssetSystemBinding.prototype,{
	exists: function(_id,_strict) {
		if(_strict == null) _strict = true;
		var listed = this.manager.listed(_id);
		return listed;
	}
	,nearest_power_of_two: function(_value) {
		_value--;
		_value |= _value >> 1;
		_value |= _value >> 2;
		_value |= _value >> 4;
		_value |= _value >> 8;
		_value |= _value >> 16;
		_value++;
		return _value;
	}
	,image_load_info: function(_path,_components,_onload) {
		if(_components == null) _components = 4;
		var ext = haxe.io.Path.extension(_path);
		switch(ext) {
		case "tga":
			return this.image_load_info_tga(_path,_components,_onload);
		case "psd":
			return this.image_load_info_psd(_path,_components,_onload);
		default:
			return this.image_load_info_generic(_path,_components,_onload);
		}
		return null;
	}
	,image_load_info_generic: function(_path,_components,_onload) {
		if(_components == null) _components = 4;
		var _g = this;
		var image;
		var _this = window.document;
		image = _this.createElement("img");
		var info = null;
		image.onload = function(a) {
			var width_pot = _g.nearest_power_of_two(image.width);
			var height_pot = _g.nearest_power_of_two(image.height);
			var image_bytes = _g.POT_Uint8Array_from_image(image.width,image.height,width_pot,height_pot,image);
			info = { id : _path, bpp : 4, width : image.width, height : image.height, width_actual : width_pot, height_actual : height_pot, bpp_source : 4, data : new Uint8Array(image_bytes.data)};
			image_bytes = null;
			if(_onload != null) _onload(info);
		};
		image.src = _path;
		return info;
	}
	,image_load_info_tga: function(_path,_components,_onload) {
		if(_components == null) _components = 4;
		var _g = this;
		var info = null;
		snow.platform.web.utils.ByteArray.readFile(_path,true,function(data) {
			var uint = new Uint8Array(data.getData());
			var image = new window.TGA();
			image.load(uint);
			var width_pot = _g.nearest_power_of_two(image.header.width);
			var height_pot = _g.nearest_power_of_two(image.header.height);
			var image_bytes = _g.POT_Uint8Array_from_image(image.header.width,image.header.height,width_pot,height_pot,image.getCanvas());
			info = { id : _path, bpp : 4, width : image.header.width, height : image.header.height, width_actual : width_pot, height_actual : height_pot, bpp_source : 4, data : new Uint8Array(image_bytes.data)};
			image_bytes = null;
			if(_onload != null) _onload(info);
		});
		return info;
	}
	,POT_Uint8Array_from_image: function(_width,_height,_width_pot,_height_pot,_source) {
		var tmp_canvas;
		var _this = window.document;
		tmp_canvas = _this.createElement("canvas");
		tmp_canvas.width = _width_pot;
		tmp_canvas.height = _height_pot;
		var tmp_context = tmp_canvas.getContext("2d");
		tmp_context.clearRect(0,0,tmp_canvas.width,tmp_canvas.height);
		tmp_context.drawImage(_source,0,0,_width,_height);
		var image_bytes = null;
		try {
			image_bytes = tmp_context.getImageData(0,0,tmp_canvas.width,tmp_canvas.height);
		} catch( e ) {
			var tips = "- textures served from file:/// throw security errors\n";
			tips += "- textures served over http:// work for cross origin byte requests";
			haxe.Log.trace("i / assets / " + tips,{ fileName : "AssetSystem.hx", lineNumber : 185, className : "snow.platform.web.assets.AssetSystem", methodName : "POT_Uint8Array_from_image"});
			throw e;
		}
		tmp_canvas = null;
		tmp_context = null;
		return image_bytes;
	}
	,image_load_info_psd: function(_path,_components,_onload) {
		if(_components == null) _components = 4;
		var _g = this;
		var info = null;
		var image = new snow.platform.web.assets.psd.PSD();
		image.open(_path,function(psdimage) {
			var png_then = function(png_image) {
				var width_pot = _g.nearest_power_of_two(psdimage.header.width);
				var height_pot = _g.nearest_power_of_two(psdimage.header.height);
				var image_bytes = _g.POT_Uint8Array_from_image(psdimage.header.width,psdimage.header.height,width_pot,height_pot,png_image);
				info = { id : _path, bpp : 4, width : psdimage.header.width, height : psdimage.header.height, width_actual : width_pot, height_actual : height_pot, bpp_source : 4, data : new Uint8Array(image_bytes.data)};
				image_bytes = null;
				if(_onload != null) _onload(info);
			};
			psdimage.image.toPng().then(png_then);
		});
		return info;
	}
	,image_info_from_bytes: function(_path,_bytes,_components) {
		if(_components == null) _components = 4;
		if(_bytes == null) {
			haxe.Log.trace("i / assets / " + ("invalid bytes passed to image_info_from_bytes " + _path),{ fileName : "AssetSystem.hx", lineNumber : 243, className : "snow.platform.web.assets.AssetSystem", methodName : "image_info_from_bytes"});
			return null;
		}
		var _raw_bytes = snow.platform.web.utils.ByteArray.toBytes(_bytes);
		var byte_input = new haxe.io.BytesInput(_raw_bytes,0,_raw_bytes.length);
		var png_data = new snow.utils.format.png.Reader(byte_input).read();
		var png_bytes = snow.utils.format.png.Tools.extract32(png_data);
		var png_header = snow.utils.format.png.Tools.getHeader(png_data);
		return { id : _path, bpp : _components, width : png_header.width, height : png_header.height, width_actual : png_header.width, height_actual : png_header.height, bpp_source : png_header.colbits, data : new Uint8Array(png_bytes.b)};
	}
	,audio_load_info: function(_path,_format,_load,_onload) {
		if(_load == null) _load = true;
		var _g = this;
		var info = { format : _format, id : _path, handle : null, data : null};
		info.handle = new window.Howl({ urls : [_path], onend : function() {
			_g.manager.lib.audio.platform._on_end(info.handle);
		}, onload : function() {
			if(_onload != null) _onload(info);
		}});
		return info;
	}
	,__class__: snow.platform.web.assets.AssetSystem
});
snow.platform.web.assets.psd = {};
snow.platform.web.assets.psd.PSD = function() {
	this._PSD = window.require("psd");
};
$hxClasses["snow.platform.web.assets.psd.PSD"] = snow.platform.web.assets.psd.PSD;
snow.platform.web.assets.psd.PSD.__name__ = true;
snow.platform.web.assets.psd.PSD.prototype = {
	open: function(_url,_psd_onload) {
		this._PSD.fromURL(_url).then(function(psd) {
			if(_psd_onload) _psd_onload(psd);
		});
	}
	,__class__: snow.platform.web.assets.psd.PSD
};
snow.platform.web.audio = {};
snow.platform.web.audio.AudioSystem = function(_manager,_lib) {
	this.manager = _manager;
	this.lib = _lib;
};
$hxClasses["snow.platform.web.audio.AudioSystem"] = snow.platform.web.audio.AudioSystem;
snow.platform.web.audio.AudioSystem.__name__ = true;
snow.platform.web.audio.AudioSystem.__super__ = snow.audio.AudioSystemBinding;
snow.platform.web.audio.AudioSystem.prototype = $extend(snow.audio.AudioSystemBinding.prototype,{
	init: function() {
	}
	,process: function() {
	}
	,destroy: function() {
	}
	,suspend: function() {
	}
	,resume: function() {
	}
	,__class__: snow.platform.web.audio.AudioSystem
});
snow.platform.web.audio.Sound = function(_manager,_name) {
	snow.audio.SoundBinding.call(this,_manager,_name);
};
$hxClasses["snow.platform.web.audio.Sound"] = snow.platform.web.audio.Sound;
snow.platform.web.audio.Sound.__name__ = true;
snow.platform.web.audio.Sound.__super__ = snow.audio.SoundBinding;
snow.platform.web.audio.Sound.prototype = $extend(snow.audio.SoundBinding.prototype,{
	__class__: snow.platform.web.audio.Sound
});
snow.platform.web.audio.howlerjs = {};
snow.platform.web.audio.howlerjs.Sound = function(_manager,_name) {
	this.volume_dirty = false;
	this.pan_dirty = false;
	snow.platform.web.audio.Sound.call(this,_manager,_name);
};
$hxClasses["snow.platform.web.audio.howlerjs.Sound"] = snow.platform.web.audio.howlerjs.Sound;
snow.platform.web.audio.howlerjs.Sound.__name__ = true;
snow.platform.web.audio.howlerjs.Sound.__super__ = snow.platform.web.audio.Sound;
snow.platform.web.audio.howlerjs.Sound.prototype = $extend(snow.platform.web.audio.Sound.prototype,{
	set_info: function(_info) {
		if(this.get_info() != null) this.destroy();
		this.info = null;
		if(_info == null) {
			haxe.Log.trace("    i / sound / " + "not creating sound, info was null",{ fileName : "Sound.hx", lineNumber : 33, className : "snow.platform.web.audio.howlerjs.Sound", methodName : "set_info"});
			return this.get_info();
		}
		this.info = _info;
		this.loaded = true;
		this.emit("load");
		return this.get_info();
	}
	,set_pan: function(_pan) {
		this.pan_dirty = true;
		return this.pan = _pan;
	}
	,set_volume: function(_volume) {
		this.volume_dirty = true;
		return this.volume = _volume;
	}
	,set_pitch: function(_pitch) {
		this.get_info().handle._rate = _pitch;
		return this.pitch = _pitch;
	}
	,set_position: function(_position) {
		if(this.get_info() != null && this.get_info().handle != null) this.get_info().handle.pos(_position);
		return this.position = _position;
	}
	,get_position: function() {
		if(this.get_info() != null && this.get_info().handle != null) return this.get_info().handle.pos();
		return this.position;
	}
	,get_duration: function() {
		if(this.get_info() != null && this.get_info().handle != null) return this.get_info().handle._duration;
		return 0;
	}
	,play: function() {
		if(this.get_info() != null && this.get_info().handle != null) {
			this.playing = true;
			this.set_looping(false);
			this.get_info().handle.loop(false);
			this.get_info().handle.play();
			if(this.pan_dirty) this.get_info().handle.pos3d(this.get_pan());
			if(this.volume_dirty) this.get_info().handle.volume(this.get_volume());
		}
	}
	,loop: function() {
		if(this.get_info() != null && this.get_info().handle != null) {
			this.playing = true;
			this.set_looping(true);
			this.get_info().handle.loop(true);
			this.get_info().handle.play();
			if(this.pan_dirty) this.get_info().handle.pos3d(this.get_pan());
			if(this.volume_dirty) this.get_info().handle.volume(this.get_volume());
		}
	}
	,stop: function() {
		this.playing = false;
		if(this.get_info() != null && this.get_info().handle != null) this.get_info().handle.stop();
	}
	,pause: function() {
		if(this.get_info() != null && this.get_info().handle != null) this.get_info().handle.pause();
	}
	,destroy: function() {
		if(this.get_info() != null && this.get_info().handle != null) this.get_info().handle.unload();
		this.manager.kill(this);
	}
	,__class__: snow.platform.web.audio.howlerjs.Sound
});
snow.platform.web.audio.SoundStream = function(_manager,_name) {
	snow.platform.web.audio.howlerjs.Sound.call(this,_manager,_name);
};
$hxClasses["snow.platform.web.audio.SoundStream"] = snow.platform.web.audio.SoundStream;
snow.platform.web.audio.SoundStream.__name__ = true;
snow.platform.web.audio.SoundStream.__super__ = snow.platform.web.audio.howlerjs.Sound;
snow.platform.web.audio.SoundStream.prototype = $extend(snow.platform.web.audio.howlerjs.Sound.prototype,{
	__class__: snow.platform.web.audio.SoundStream
});
snow.platform.web.audio.howlerjs.AudioSystem = function(_manager,_lib) {
	snow.platform.web.audio.AudioSystem.call(this,_manager,_lib);
};
$hxClasses["snow.platform.web.audio.howlerjs.AudioSystem"] = snow.platform.web.audio.howlerjs.AudioSystem;
snow.platform.web.audio.howlerjs.AudioSystem.__name__ = true;
snow.platform.web.audio.howlerjs.AudioSystem.__super__ = snow.platform.web.audio.AudioSystem;
snow.platform.web.audio.howlerjs.AudioSystem.prototype = $extend(snow.platform.web.audio.AudioSystem.prototype,{
	init: function() {
		this.suspended_sounds = [];
	}
	,process: function() {
	}
	,destroy: function() {
	}
	,suspend: function() {
		var $it0 = this.manager.handles.iterator();
		while( $it0.hasNext() ) {
			var sound = $it0.next();
			if(sound.playing) {
				sound.toggle();
				this.suspended_sounds.push(sound);
			}
		}
	}
	,resume: function() {
		while(this.suspended_sounds.length > 0) {
			var sound = this.suspended_sounds.pop();
			sound.toggle();
		}
	}
	,_on_end: function(handle) {
		var sound = this.manager.handles.h[handle.__id__];
		if(sound != null) sound.emit("end");
	}
	,__class__: snow.platform.web.audio.howlerjs.AudioSystem
});
snow.platform.web.audio.howlerjs.SoundStream = function(_manager,_name) {
	snow.platform.web.audio.SoundStream.call(this,_manager,_name);
};
$hxClasses["snow.platform.web.audio.howlerjs.SoundStream"] = snow.platform.web.audio.howlerjs.SoundStream;
snow.platform.web.audio.howlerjs.SoundStream.__name__ = true;
snow.platform.web.audio.howlerjs.SoundStream.__super__ = snow.platform.web.audio.SoundStream;
snow.platform.web.audio.howlerjs.SoundStream.prototype = $extend(snow.platform.web.audio.SoundStream.prototype,{
	__class__: snow.platform.web.audio.howlerjs.SoundStream
});
snow.platform.web.input = {};
snow.platform.web.input.DOMKeys = function() { };
$hxClasses["snow.platform.web.input.DOMKeys"] = snow.platform.web.input.DOMKeys;
snow.platform.web.input.DOMKeys.__name__ = true;
snow.platform.web.input.DOMKeys.dom_key_to_keycode = function(_keycode) {
	switch(_keycode) {
	case 16:
		return snow.input.Keycodes.lshift;
	case 17:
		return snow.input.Keycodes.lctrl;
	case 18:
		return snow.input.Keycodes.lalt;
	case 20:
		return snow.input.Keycodes.capslock;
	case 33:
		return snow.input.Keycodes.pageup;
	case 34:
		return snow.input.Keycodes.pagedown;
	case 35:
		return snow.input.Keycodes.end;
	case 36:
		return snow.input.Keycodes.home;
	case 37:
		return snow.input.Keycodes.left;
	case 38:
		return snow.input.Keycodes.up;
	case 39:
		return snow.input.Keycodes.right;
	case 40:
		return snow.input.Keycodes.down;
	case 44:
		return snow.input.Keycodes.printscreen;
	case 45:
		return snow.input.Keycodes.insert;
	case 46:
		return snow.input.Keycodes["delete"];
	case 91:
		return snow.input.Keycodes.lmeta;
	case 93:
		return snow.input.Keycodes.rmeta;
	case 224:
		return snow.input.Keycodes.lmeta;
	case 96:
		return snow.input.Keycodes.kp_0;
	case 97:
		return snow.input.Keycodes.kp_1;
	case 98:
		return snow.input.Keycodes.kp_2;
	case 99:
		return snow.input.Keycodes.kp_3;
	case 100:
		return snow.input.Keycodes.kp_4;
	case 101:
		return snow.input.Keycodes.kp_5;
	case 102:
		return snow.input.Keycodes.kp_6;
	case 103:
		return snow.input.Keycodes.kp_7;
	case 104:
		return snow.input.Keycodes.kp_8;
	case 105:
		return snow.input.Keycodes.kp_9;
	case 106:
		return snow.input.Keycodes.kp_multiply;
	case 107:
		return snow.input.Keycodes.kp_plus;
	case 109:
		return snow.input.Keycodes.kp_minus;
	case 110:
		return snow.input.Keycodes.kp_decimal;
	case 111:
		return snow.input.Keycodes.kp_divide;
	case 144:
		return snow.input.Keycodes.numlockclear;
	case 112:
		return snow.input.Keycodes.f1;
	case 113:
		return snow.input.Keycodes.f2;
	case 114:
		return snow.input.Keycodes.f3;
	case 115:
		return snow.input.Keycodes.f4;
	case 116:
		return snow.input.Keycodes.f5;
	case 117:
		return snow.input.Keycodes.f6;
	case 118:
		return snow.input.Keycodes.f7;
	case 119:
		return snow.input.Keycodes.f8;
	case 120:
		return snow.input.Keycodes.f9;
	case 121:
		return snow.input.Keycodes.f10;
	case 122:
		return snow.input.Keycodes.f11;
	case 123:
		return snow.input.Keycodes.f12;
	case 124:
		return snow.input.Keycodes.f13;
	case 125:
		return snow.input.Keycodes.f14;
	case 126:
		return snow.input.Keycodes.f15;
	case 127:
		return snow.input.Keycodes.f16;
	case 128:
		return snow.input.Keycodes.f17;
	case 129:
		return snow.input.Keycodes.f18;
	case 130:
		return snow.input.Keycodes.f19;
	case 131:
		return snow.input.Keycodes.f20;
	case 132:
		return snow.input.Keycodes.f21;
	case 133:
		return snow.input.Keycodes.f22;
	case 134:
		return snow.input.Keycodes.f23;
	case 135:
		return snow.input.Keycodes.f24;
	case 160:
		return snow.input.Keycodes.caret;
	case 161:
		return snow.input.Keycodes.exclaim;
	case 162:
		return snow.input.Keycodes.quotedbl;
	case 163:
		return snow.input.Keycodes.hash;
	case 164:
		return snow.input.Keycodes.dollar;
	case 165:
		return snow.input.Keycodes.percent;
	case 166:
		return snow.input.Keycodes.ampersand;
	case 167:
		return snow.input.Keycodes.underscore;
	case 168:
		return snow.input.Keycodes.leftparen;
	case 169:
		return snow.input.Keycodes.rightparen;
	case 170:
		return snow.input.Keycodes.asterisk;
	case 171:
		return snow.input.Keycodes.plus;
	case 172:
		return snow.input.Keycodes.backslash;
	case 173:
		return snow.input.Keycodes.minus;
	case 174:
		return snow.input.Keycodes.leftbracket;
	case 175:
		return snow.input.Keycodes.rightbracket;
	case 176:
		return snow.input.Keycodes.backquote;
	case 181:
		return snow.input.Keycodes.audiomute;
	case 182:
		return snow.input.Keycodes.volumedown;
	case 183:
		return snow.input.Keycodes.volumeup;
	case 188:
		return snow.input.Keycodes.comma;
	case 190:
		return snow.input.Keycodes.period;
	case 191:
		return snow.input.Keycodes.slash;
	case 192:
		return snow.input.Keycodes.backquote;
	case 219:
		return snow.input.Keycodes.leftbracket;
	case 221:
		return snow.input.Keycodes.rightbracket;
	case 220:
		return snow.input.Keycodes.backslash;
	case 222:
		return snow.input.Keycodes.quote;
	}
	return _keycode;
};
snow.platform.web.input.InputSystem = function(_manager,_lib) {
	this.gamepads_supported = false;
	this.manager = _manager;
	this.lib = _lib;
};
$hxClasses["snow.platform.web.input.InputSystem"] = snow.platform.web.input.InputSystem;
snow.platform.web.input.InputSystem.__name__ = true;
snow.platform.web.input.InputSystem.__super__ = snow.input.InputSystemBinding;
snow.platform.web.input.InputSystem.prototype = $extend(snow.input.InputSystemBinding.prototype,{
	init: function() {
		window.document.addEventListener("keydown",$bind(this,this.on_keydown));
		window.document.addEventListener("keyup",$bind(this,this.on_keyup));
		this.active_gamepads = new haxe.ds.IntMap();
		this.gamepads_supported = this.get_gamepad_list() != null;
		haxe.Log.trace("i / input / " + ("Gamepads supported: " + Std.string(this.gamepads_supported)),{ fileName : "InputSystem.hx", lineNumber : 56, className : "snow.platform.web.input.InputSystem", methodName : "init"});
	}
	,process: function() {
		if(this.gamepads_supported) this.poll_gamepads();
	}
	,destroy: function() {
	}
	,listen: function(window) {
		window.handle.addEventListener("contextmenu",$bind(this,this.on_contextmenu));
		window.handle.addEventListener("mousedown",$bind(this,this.on_mousedown));
		window.handle.addEventListener("mouseup",$bind(this,this.on_mouseup));
		window.handle.addEventListener("mousemove",$bind(this,this.on_mousemove));
		window.handle.addEventListener("mousewheel",$bind(this,this.on_mousewheel));
		window.handle.addEventListener("wheel",$bind(this,this.on_mousewheel));
	}
	,unlisten: function(window) {
	}
	,on_event: function(_event) {
	}
	,text_input_start: function() {
	}
	,text_input_stop: function() {
	}
	,text_input_rect: function(x,y,w,h) {
	}
	,gamepad_add: function(id) {
	}
	,gamepad_remove: function(id) {
	}
	,poll_gamepads: function() {
		if(!this.gamepads_supported) return;
		var list = this.get_gamepad_list();
		if(list != null) {
			var _g1 = 0;
			var _g = list.length;
			while(_g1 < _g) {
				var i = _g1++;
				if(list[i] != null) this.handle_gamepad(list[i]); else {
					var _gamepad = this.active_gamepads.get(i);
					if(_gamepad != null) this.manager.dispatch_gamepad_device_event(_gamepad.index,2,snow.Snow.core.timestamp());
					this.active_gamepads.remove(i);
				}
			}
		}
	}
	,handle_gamepad: function(_gamepad) {
		if(_gamepad == null) return;
		if(!(function($this) {
			var $r;
			var key = _gamepad.index;
			$r = $this.active_gamepads.exists(key);
			return $r;
		}(this))) {
			var _new_gamepad = { id : _gamepad.id, index : _gamepad.index, axes : [], buttons : [], timestamp : snow.Snow.core.timestamp()};
			var axes = _gamepad.axes;
			var _g = 0;
			while(_g < axes.length) {
				var value = axes[_g];
				++_g;
				_new_gamepad.axes.push(value);
			}
			var _button_list = _gamepad.buttons;
			var _g1 = 0;
			while(_g1 < _button_list.length) {
				var _button = _button_list[_g1];
				++_g1;
				_new_gamepad.buttons.push({ pressed : false, value : 0});
			}
			this.active_gamepads.set(_new_gamepad.index,_new_gamepad);
			this.manager.dispatch_gamepad_device_event(_new_gamepad.index,1,_new_gamepad.timestamp);
		} else {
			var gamepad;
			var key1 = _gamepad.index;
			gamepad = this.active_gamepads.get(key1);
			if(gamepad.id != _gamepad.id) gamepad.id = _gamepad.id;
			var axes_changed = [];
			var buttons_changed = [];
			var last_axes = gamepad.axes;
			var last_buttons = gamepad.buttons;
			var new_axes = _gamepad.axes;
			var new_buttons = _gamepad.buttons;
			var axis_index = 0;
			var _g2 = 0;
			while(_g2 < new_axes.length) {
				var axis = new_axes[_g2];
				++_g2;
				if(axis != last_axes[axis_index]) {
					axes_changed.push(axis_index);
					gamepad.axes[axis_index] = axis;
				}
				axis_index++;
			}
			var button_index = 0;
			var _g3 = 0;
			while(_g3 < new_buttons.length) {
				var button = new_buttons[_g3];
				++_g3;
				if(button.value != last_buttons[button_index].value) {
					buttons_changed.push(button_index);
					gamepad.buttons[button_index].pressed = button.pressed;
					gamepad.buttons[button_index].value = button.value;
				}
				button_index++;
			}
			var _g4 = 0;
			while(_g4 < axes_changed.length) {
				var index = axes_changed[_g4];
				++_g4;
				this.manager.dispatch_gamepad_axis_event(gamepad.index,index,new_axes[index],gamepad.timestamp);
			}
			var _g5 = 0;
			while(_g5 < buttons_changed.length) {
				var index1 = buttons_changed[_g5];
				++_g5;
				if(new_buttons[index1].pressed == true) this.manager.dispatch_gamepad_button_down_event(gamepad.index,index1,new_buttons[index1].value,gamepad.timestamp); else this.manager.dispatch_gamepad_button_up_event(gamepad.index,index1,new_buttons[index1].value,gamepad.timestamp);
			}
		}
	}
	,fail_gamepads: function() {
		this.gamepads_supported = false;
		haxe.Log.trace("i / input / " + "Gamepads are not supported in this browser :(",{ fileName : "InputSystem.hx", lineNumber : 283, className : "snow.platform.web.input.InputSystem", methodName : "fail_gamepads"});
	}
	,get_gamepad_list: function() {
		var modernizr = window.Modernizr;
		if(modernizr != null) {
			if(modernizr.gamepads == true) {
				if(($_=window.navigator,$bind($_,$_.getGamepads)) != null) return window.navigator.getGamepads();
				if(window.navigator.webkitGetGamepads != null) return window.navigator.webkitGetGamepads();
				this.fail_gamepads();
			} else this.fail_gamepads();
		}
		return null;
	}
	,on_mousedown: function(_mouse_event) {
		var _window = this.lib.windowing.window_from_handle(_mouse_event.target);
		this.manager.dispatch_mouse_down_event(_mouse_event.pageX - window.pageXOffset - _window.x,_mouse_event.pageY - window.pageYOffset - _window.y,_mouse_event.button + 1,_mouse_event.timeStamp,_window.id);
	}
	,on_mouseup: function(_mouse_event) {
		var _window = this.lib.windowing.window_from_handle(_mouse_event.target);
		this.manager.dispatch_mouse_up_event(_mouse_event.pageX - window.pageXOffset - _window.x,_mouse_event.pageY - window.pageYOffset - _window.y,_mouse_event.button + 1,_mouse_event.timeStamp,_window.id);
	}
	,on_mousemove: function(_mouse_event) {
		var _window = this.lib.windowing.window_from_handle(_mouse_event.target);
		var _movement_x = _mouse_event.movementX;
		var _movement_y = _mouse_event.movementY;
		if(_mouse_event.webkitMovementX != null) {
			_movement_x = _mouse_event.webkitMovementX;
			_movement_y = _mouse_event.webkitMovementY;
		} else if(_mouse_event.mozMovementX != null) {
			_movement_x = _mouse_event.mozMovementX;
			_movement_y = _mouse_event.mozMovementY;
		}
		this.manager.dispatch_mouse_move_event(_mouse_event.pageX - window.pageXOffset - _window.x,_mouse_event.pageY - window.pageYOffset - _window.y,_movement_x,_movement_y,_mouse_event.timeStamp,_window.id);
	}
	,on_mousewheel: function(_wheel_event) {
		var _window = this.lib.windowing.window_from_handle(_wheel_event.target);
		var _x = 0;
		var _y = 0;
		if(_wheel_event.deltaY != null) _y = _wheel_event.deltaY; else if(_wheel_event.wheelDeltaY != null) _y = -_wheel_event.wheelDeltaY / 3 | 0;
		if(_wheel_event.deltaX != null) _x = _wheel_event.deltaX; else if(_wheel_event.wheelDeltaX != null) _x = -_wheel_event.wheelDeltaX / 3 | 0;
		this.manager.dispatch_mouse_wheel_event(Math.round(_x / 16),Math.round(_y / 16),_wheel_event.timeStamp,_window.id);
	}
	,on_contextmenu: function(_event) {
		if(this.lib.config.web.no_context_menu) _event.preventDefault();
	}
	,on_keydown: function(_key_event) {
		var _keycode = this.convert_keycode(_key_event.keyCode);
		var _scancode = snow.input.Keycodes.to_scan(_keycode);
		var _mod_state = this.mod_state_from_event(_key_event);
		this.manager.dispatch_key_down_event(_keycode,_scancode,_key_event.repeat,_mod_state,_key_event.timeStamp,1);
	}
	,on_keyup: function(_key_event) {
		var _keycode = this.convert_keycode(_key_event.keyCode);
		var _scancode = snow.input.Keycodes.to_scan(_keycode);
		var _mod_state = this.mod_state_from_event(_key_event);
		this.manager.dispatch_key_up_event(_keycode,_scancode,_key_event.repeat,_mod_state,_key_event.timeStamp,1);
	}
	,mod_state_from_event: function(_key_event) {
		var _none = !_key_event.altKey && !_key_event.ctrlKey && !_key_event.metaKey && !_key_event.shiftKey;
		return { none : _none, lshift : _key_event.shiftKey, rshift : _key_event.shiftKey, lctrl : _key_event.ctrlKey, rctrl : _key_event.ctrlKey, lalt : _key_event.altKey, ralt : _key_event.altKey, lmeta : _key_event.metaKey, rmeta : _key_event.metaKey, num : false, caps : false, mode : false, ctrl : _key_event.ctrlKey, shift : _key_event.shiftKey, alt : _key_event.altKey, meta : _key_event.metaKey};
	}
	,convert_keycode: function(dom_keycode) {
		if(dom_keycode >= 65 && dom_keycode <= 90) return dom_keycode + 32;
		return snow.platform.web.input.DOMKeys.dom_key_to_keycode(dom_keycode);
	}
	,__class__: snow.platform.web.input.InputSystem
});
snow.platform.web.io = {};
snow.platform.web.io.IOSystem = function(_manager,_lib) {
	this.manager = _manager;
	this.lib = _lib;
};
$hxClasses["snow.platform.web.io.IOSystem"] = snow.platform.web.io.IOSystem;
snow.platform.web.io.IOSystem.__name__ = true;
snow.platform.web.io.IOSystem.__super__ = snow.io.IOSystemBinding;
snow.platform.web.io.IOSystem.prototype = $extend(snow.io.IOSystemBinding.prototype,{
	url_open: function(_url) {
		if(_url != null && _url.length > 0) window.open(_url,"_blank");
	}
	,init: function() {
	}
	,process: function() {
	}
	,destroy: function() {
	}
	,on_event: function(_event) {
	}
	,__class__: snow.platform.web.io.IOSystem
});
snow.platform.web.render = {};
snow.platform.web.render.opengl = {};
snow.platform.web.render.opengl.GL = function() { };
$hxClasses["snow.platform.web.render.opengl.GL"] = snow.platform.web.render.opengl.GL;
snow.platform.web.render.opengl.GL.__name__ = true;
snow.platform.web.render.opengl.GL.versionString = function() {
	var ver = snow.platform.web.render.opengl.GL.current_context.getParameter(7938);
	var slver = snow.platform.web.render.opengl.GL.current_context.getParameter(35724);
	var ren = snow.platform.web.render.opengl.GL.current_context.getParameter(7937);
	var ven = snow.platform.web.render.opengl.GL.current_context.getParameter(7936);
	return "/ " + ver + " / " + slver + " / " + ren + " / " + ven + " /";
};
snow.platform.web.render.opengl.GL.activeTexture = function(texture) {
	snow.platform.web.render.opengl.GL.current_context.activeTexture(texture);
};
snow.platform.web.render.opengl.GL.attachShader = function(program,shader) {
	snow.platform.web.render.opengl.GL.current_context.attachShader(program,shader);
};
snow.platform.web.render.opengl.GL.bindAttribLocation = function(program,index,name) {
	snow.platform.web.render.opengl.GL.current_context.bindAttribLocation(program,index,name);
};
snow.platform.web.render.opengl.GL.bindBuffer = function(target,buffer) {
	snow.platform.web.render.opengl.GL.current_context.bindBuffer(target,buffer);
};
snow.platform.web.render.opengl.GL.bindFramebuffer = function(target,framebuffer) {
	snow.platform.web.render.opengl.GL.current_context.bindFramebuffer(target,framebuffer);
};
snow.platform.web.render.opengl.GL.bindRenderbuffer = function(target,renderbuffer) {
	snow.platform.web.render.opengl.GL.current_context.bindRenderbuffer(target,renderbuffer);
};
snow.platform.web.render.opengl.GL.bindTexture = function(target,texture) {
	snow.platform.web.render.opengl.GL.current_context.bindTexture(target,texture);
};
snow.platform.web.render.opengl.GL.blendColor = function(red,green,blue,alpha) {
	snow.platform.web.render.opengl.GL.current_context.blendColor(red,green,blue,alpha);
};
snow.platform.web.render.opengl.GL.blendEquation = function(mode) {
	snow.platform.web.render.opengl.GL.current_context.blendEquation(mode);
};
snow.platform.web.render.opengl.GL.blendEquationSeparate = function(modeRGB,modeAlpha) {
	snow.platform.web.render.opengl.GL.current_context.blendEquationSeparate(modeRGB,modeAlpha);
};
snow.platform.web.render.opengl.GL.blendFunc = function(sfactor,dfactor) {
	snow.platform.web.render.opengl.GL.current_context.blendFunc(sfactor,dfactor);
};
snow.platform.web.render.opengl.GL.blendFuncSeparate = function(srcRGB,dstRGB,srcAlpha,dstAlpha) {
	snow.platform.web.render.opengl.GL.current_context.blendFuncSeparate(srcRGB,dstRGB,srcAlpha,dstAlpha);
};
snow.platform.web.render.opengl.GL.bufferData = function(target,data,usage) {
	snow.platform.web.render.opengl.GL.current_context.bufferData(target,data,usage);
};
snow.platform.web.render.opengl.GL.bufferSubData = function(target,offset,data) {
	snow.platform.web.render.opengl.GL.current_context.bufferSubData(target,offset,data);
};
snow.platform.web.render.opengl.GL.checkFramebufferStatus = function(target) {
	return snow.platform.web.render.opengl.GL.current_context.checkFramebufferStatus(target);
};
snow.platform.web.render.opengl.GL.clear = function(mask) {
	snow.platform.web.render.opengl.GL.current_context.clear(mask);
};
snow.platform.web.render.opengl.GL.clearColor = function(red,green,blue,alpha) {
	snow.platform.web.render.opengl.GL.current_context.clearColor(red,green,blue,alpha);
};
snow.platform.web.render.opengl.GL.clearDepth = function(depth) {
	snow.platform.web.render.opengl.GL.current_context.clearDepth(depth);
};
snow.platform.web.render.opengl.GL.clearStencil = function(s) {
	snow.platform.web.render.opengl.GL.current_context.clearStencil(s);
};
snow.platform.web.render.opengl.GL.colorMask = function(red,green,blue,alpha) {
	snow.platform.web.render.opengl.GL.current_context.colorMask(red,green,blue,alpha);
};
snow.platform.web.render.opengl.GL.compileShader = function(shader) {
	snow.platform.web.render.opengl.GL.current_context.compileShader(shader);
};
snow.platform.web.render.opengl.GL.compressedTexImage2D = function(target,level,internalformat,width,height,border,data) {
	snow.platform.web.render.opengl.GL.current_context.compressedTexImage2D(target,level,internalformat,width,height,border,data);
};
snow.platform.web.render.opengl.GL.compressedTexSubImage2D = function(target,level,xoffset,yoffset,width,height,format,data) {
	snow.platform.web.render.opengl.GL.current_context.compressedTexSubImage2D(target,level,xoffset,yoffset,width,height,format,data);
};
snow.platform.web.render.opengl.GL.copyTexImage2D = function(target,level,internalformat,x,y,width,height,border) {
	snow.platform.web.render.opengl.GL.current_context.copyTexImage2D(target,level,internalformat,x,y,width,height,border);
};
snow.platform.web.render.opengl.GL.copyTexSubImage2D = function(target,level,xoffset,yoffset,x,y,width,height) {
	snow.platform.web.render.opengl.GL.current_context.copyTexSubImage2D(target,level,xoffset,yoffset,x,y,width,height);
};
snow.platform.web.render.opengl.GL.createBuffer = function() {
	return snow.platform.web.render.opengl.GL.current_context.createBuffer();
};
snow.platform.web.render.opengl.GL.createFramebuffer = function() {
	return snow.platform.web.render.opengl.GL.current_context.createFramebuffer();
};
snow.platform.web.render.opengl.GL.createProgram = function() {
	return snow.platform.web.render.opengl.GL.current_context.createProgram();
};
snow.platform.web.render.opengl.GL.createRenderbuffer = function() {
	return snow.platform.web.render.opengl.GL.current_context.createRenderbuffer();
};
snow.platform.web.render.opengl.GL.createShader = function(type) {
	return snow.platform.web.render.opengl.GL.current_context.createShader(type);
};
snow.platform.web.render.opengl.GL.createTexture = function() {
	return snow.platform.web.render.opengl.GL.current_context.createTexture();
};
snow.platform.web.render.opengl.GL.cullFace = function(mode) {
	snow.platform.web.render.opengl.GL.current_context.cullFace(mode);
};
snow.platform.web.render.opengl.GL.deleteBuffer = function(buffer) {
	snow.platform.web.render.opengl.GL.current_context.deleteBuffer(buffer);
};
snow.platform.web.render.opengl.GL.deleteFramebuffer = function(framebuffer) {
	snow.platform.web.render.opengl.GL.current_context.deleteFramebuffer(framebuffer);
};
snow.platform.web.render.opengl.GL.deleteProgram = function(program) {
	snow.platform.web.render.opengl.GL.current_context.deleteProgram(program);
};
snow.platform.web.render.opengl.GL.deleteRenderbuffer = function(renderbuffer) {
	snow.platform.web.render.opengl.GL.current_context.deleteRenderbuffer(renderbuffer);
};
snow.platform.web.render.opengl.GL.deleteShader = function(shader) {
	snow.platform.web.render.opengl.GL.current_context.deleteShader(shader);
};
snow.platform.web.render.opengl.GL.deleteTexture = function(texture) {
	snow.platform.web.render.opengl.GL.current_context.deleteTexture(texture);
};
snow.platform.web.render.opengl.GL.depthFunc = function(func) {
	snow.platform.web.render.opengl.GL.current_context.depthFunc(func);
};
snow.platform.web.render.opengl.GL.depthMask = function(flag) {
	snow.platform.web.render.opengl.GL.current_context.depthMask(flag);
};
snow.platform.web.render.opengl.GL.depthRange = function(zNear,zFar) {
	snow.platform.web.render.opengl.GL.current_context.depthRange(zNear,zFar);
};
snow.platform.web.render.opengl.GL.detachShader = function(program,shader) {
	snow.platform.web.render.opengl.GL.current_context.detachShader(program,shader);
};
snow.platform.web.render.opengl.GL.disable = function(cap) {
	snow.platform.web.render.opengl.GL.current_context.disable(cap);
};
snow.platform.web.render.opengl.GL.disableVertexAttribArray = function(index) {
	snow.platform.web.render.opengl.GL.current_context.disableVertexAttribArray(index);
};
snow.platform.web.render.opengl.GL.drawArrays = function(mode,first,count) {
	snow.platform.web.render.opengl.GL.current_context.drawArrays(mode,first,count);
};
snow.platform.web.render.opengl.GL.drawElements = function(mode,count,type,offset) {
	snow.platform.web.render.opengl.GL.current_context.drawElements(mode,count,type,offset);
};
snow.platform.web.render.opengl.GL.enable = function(cap) {
	snow.platform.web.render.opengl.GL.current_context.enable(cap);
};
snow.platform.web.render.opengl.GL.enableVertexAttribArray = function(index) {
	snow.platform.web.render.opengl.GL.current_context.enableVertexAttribArray(index);
};
snow.platform.web.render.opengl.GL.finish = function() {
	snow.platform.web.render.opengl.GL.current_context.finish();
};
snow.platform.web.render.opengl.GL.flush = function() {
	snow.platform.web.render.opengl.GL.current_context.flush();
};
snow.platform.web.render.opengl.GL.framebufferRenderbuffer = function(target,attachment,renderbuffertarget,renderbuffer) {
	snow.platform.web.render.opengl.GL.current_context.framebufferRenderbuffer(target,attachment,renderbuffertarget,renderbuffer);
};
snow.platform.web.render.opengl.GL.framebufferTexture2D = function(target,attachment,textarget,texture,level) {
	snow.platform.web.render.opengl.GL.current_context.framebufferTexture2D(target,attachment,textarget,texture,level);
};
snow.platform.web.render.opengl.GL.frontFace = function(mode) {
	snow.platform.web.render.opengl.GL.current_context.frontFace(mode);
};
snow.platform.web.render.opengl.GL.generateMipmap = function(target) {
	snow.platform.web.render.opengl.GL.current_context.generateMipmap(target);
};
snow.platform.web.render.opengl.GL.getActiveAttrib = function(program,index) {
	return snow.platform.web.render.opengl.GL.current_context.getActiveAttrib(program,index);
};
snow.platform.web.render.opengl.GL.getActiveUniform = function(program,index) {
	return snow.platform.web.render.opengl.GL.current_context.getActiveUniform(program,index);
};
snow.platform.web.render.opengl.GL.getAttachedShaders = function(program) {
	return snow.platform.web.render.opengl.GL.current_context.getAttachedShaders(program);
};
snow.platform.web.render.opengl.GL.getAttribLocation = function(program,name) {
	return snow.platform.web.render.opengl.GL.current_context.getAttribLocation(program,name);
};
snow.platform.web.render.opengl.GL.getBufferParameter = function(target,pname) {
	return snow.platform.web.render.opengl.GL.current_context.getBufferParameter(target,pname);
};
snow.platform.web.render.opengl.GL.getContextAttributes = function() {
	return snow.platform.web.render.opengl.GL.current_context.getContextAttributes();
};
snow.platform.web.render.opengl.GL.getError = function() {
	return snow.platform.web.render.opengl.GL.current_context.getError();
};
snow.platform.web.render.opengl.GL.getExtension = function(name) {
	return snow.platform.web.render.opengl.GL.current_context.getExtension(name);
};
snow.platform.web.render.opengl.GL.getFramebufferAttachmentParameter = function(target,attachment,pname) {
	return snow.platform.web.render.opengl.GL.current_context.getFramebufferAttachmentParameter(target,attachment,pname);
};
snow.platform.web.render.opengl.GL.getParameter = function(pname) {
	return snow.platform.web.render.opengl.GL.current_context.getParameter(pname);
};
snow.platform.web.render.opengl.GL.getProgramInfoLog = function(program) {
	return snow.platform.web.render.opengl.GL.current_context.getProgramInfoLog(program);
};
snow.platform.web.render.opengl.GL.getProgramParameter = function(program,pname) {
	return snow.platform.web.render.opengl.GL.current_context.getProgramParameter(program,pname);
};
snow.platform.web.render.opengl.GL.getRenderbufferParameter = function(target,pname) {
	return snow.platform.web.render.opengl.GL.current_context.getRenderbufferParameter(target,pname);
};
snow.platform.web.render.opengl.GL.getShaderInfoLog = function(shader) {
	return snow.platform.web.render.opengl.GL.current_context.getShaderInfoLog(shader);
};
snow.platform.web.render.opengl.GL.getShaderParameter = function(shader,pname) {
	return snow.platform.web.render.opengl.GL.current_context.getShaderParameter(shader,pname);
};
snow.platform.web.render.opengl.GL.getShaderPrecisionFormat = function(shadertype,precisiontype) {
	return snow.platform.web.render.opengl.GL.current_context.getShaderPrecisionFormat(shadertype,precisiontype);
};
snow.platform.web.render.opengl.GL.getShaderSource = function(shader) {
	return snow.platform.web.render.opengl.GL.current_context.getShaderSource(shader);
};
snow.platform.web.render.opengl.GL.getSupportedExtensions = function() {
	return snow.platform.web.render.opengl.GL.current_context.getSupportedExtensions();
};
snow.platform.web.render.opengl.GL.getTexParameter = function(target,pname) {
	return snow.platform.web.render.opengl.GL.current_context.getTexParameter(target,pname);
};
snow.platform.web.render.opengl.GL.getUniform = function(program,location) {
	return snow.platform.web.render.opengl.GL.current_context.getUniform(program,location);
};
snow.platform.web.render.opengl.GL.getUniformLocation = function(program,name) {
	return snow.platform.web.render.opengl.GL.current_context.getUniformLocation(program,name);
};
snow.platform.web.render.opengl.GL.getVertexAttrib = function(index,pname) {
	return snow.platform.web.render.opengl.GL.current_context.getVertexAttrib(index,pname);
};
snow.platform.web.render.opengl.GL.getVertexAttribOffset = function(index,pname) {
	return snow.platform.web.render.opengl.GL.current_context.getVertexAttribOffset(index,pname);
};
snow.platform.web.render.opengl.GL.hint = function(target,mode) {
	snow.platform.web.render.opengl.GL.current_context.hint(target,mode);
};
snow.platform.web.render.opengl.GL.isBuffer = function(buffer) {
	return snow.platform.web.render.opengl.GL.current_context.isBuffer(buffer);
};
snow.platform.web.render.opengl.GL.isEnabled = function(cap) {
	return snow.platform.web.render.opengl.GL.current_context.isEnabled(cap);
};
snow.platform.web.render.opengl.GL.isFramebuffer = function(framebuffer) {
	return snow.platform.web.render.opengl.GL.current_context.isFramebuffer(framebuffer);
};
snow.platform.web.render.opengl.GL.isProgram = function(program) {
	return snow.platform.web.render.opengl.GL.current_context.isProgram(program);
};
snow.platform.web.render.opengl.GL.isRenderbuffer = function(renderbuffer) {
	return snow.platform.web.render.opengl.GL.current_context.isRenderbuffer(renderbuffer);
};
snow.platform.web.render.opengl.GL.isShader = function(shader) {
	return snow.platform.web.render.opengl.GL.current_context.isShader(shader);
};
snow.platform.web.render.opengl.GL.isTexture = function(texture) {
	return snow.platform.web.render.opengl.GL.current_context.isTexture(texture);
};
snow.platform.web.render.opengl.GL.lineWidth = function(width) {
	snow.platform.web.render.opengl.GL.current_context.lineWidth(width);
};
snow.platform.web.render.opengl.GL.linkProgram = function(program) {
	snow.platform.web.render.opengl.GL.current_context.linkProgram(program);
};
snow.platform.web.render.opengl.GL.pixelStorei = function(pname,param) {
	snow.platform.web.render.opengl.GL.current_context.pixelStorei(pname,param);
};
snow.platform.web.render.opengl.GL.polygonOffset = function(factor,units) {
	snow.platform.web.render.opengl.GL.current_context.polygonOffset(factor,units);
};
snow.platform.web.render.opengl.GL.readPixels = function(x,y,width,height,format,type,pixels) {
	snow.platform.web.render.opengl.GL.current_context.readPixels(x,y,width,height,format,type,pixels);
};
snow.platform.web.render.opengl.GL.renderbufferStorage = function(target,internalformat,width,height) {
	snow.platform.web.render.opengl.GL.current_context.renderbufferStorage(target,internalformat,width,height);
};
snow.platform.web.render.opengl.GL.sampleCoverage = function(value,invert) {
	snow.platform.web.render.opengl.GL.current_context.sampleCoverage(value,invert);
};
snow.platform.web.render.opengl.GL.scissor = function(x,y,width,height) {
	snow.platform.web.render.opengl.GL.current_context.scissor(x,y,width,height);
};
snow.platform.web.render.opengl.GL.shaderSource = function(shader,source) {
	snow.platform.web.render.opengl.GL.current_context.shaderSource(shader,source);
};
snow.platform.web.render.opengl.GL.stencilFunc = function(func,ref,mask) {
	snow.platform.web.render.opengl.GL.current_context.stencilFunc(func,ref,mask);
};
snow.platform.web.render.opengl.GL.stencilFuncSeparate = function(face,func,ref,mask) {
	snow.platform.web.render.opengl.GL.current_context.stencilFuncSeparate(face,func,ref,mask);
};
snow.platform.web.render.opengl.GL.stencilMask = function(mask) {
	snow.platform.web.render.opengl.GL.current_context.stencilMask(mask);
};
snow.platform.web.render.opengl.GL.stencilMaskSeparate = function(face,mask) {
	snow.platform.web.render.opengl.GL.current_context.stencilMaskSeparate(face,mask);
};
snow.platform.web.render.opengl.GL.stencilOp = function(fail,zfail,zpass) {
	snow.platform.web.render.opengl.GL.current_context.stencilOp(fail,zfail,zpass);
};
snow.platform.web.render.opengl.GL.stencilOpSeparate = function(face,fail,zfail,zpass) {
	snow.platform.web.render.opengl.GL.current_context.stencilOpSeparate(face,fail,zfail,zpass);
};
snow.platform.web.render.opengl.GL.texImage2D = function(target,level,internalformat,width,height,border,format,type,pixels) {
	snow.platform.web.render.opengl.GL.current_context.texImage2D(target,level,internalformat,width,height,border,format,type,pixels);
};
snow.platform.web.render.opengl.GL.texParameterf = function(target,pname,param) {
	snow.platform.web.render.opengl.GL.current_context.texParameterf(target,pname,param);
};
snow.platform.web.render.opengl.GL.texParameteri = function(target,pname,param) {
	snow.platform.web.render.opengl.GL.current_context.texParameteri(target,pname,param);
};
snow.platform.web.render.opengl.GL.texSubImage2D = function(target,level,xoffset,yoffset,width,height,format,type,pixels) {
	snow.platform.web.render.opengl.GL.current_context.texSubImage2D(target,level,xoffset,yoffset,width,height,format,type,pixels);
};
snow.platform.web.render.opengl.GL.uniform1f = function(location,x) {
	snow.platform.web.render.opengl.GL.current_context.uniform1f(location,x);
};
snow.platform.web.render.opengl.GL.uniform1fv = function(location,x) {
	snow.platform.web.render.opengl.GL.current_context.uniform1fv(location,x);
};
snow.platform.web.render.opengl.GL.uniform1i = function(location,x) {
	snow.platform.web.render.opengl.GL.current_context.uniform1i(location,x);
};
snow.platform.web.render.opengl.GL.uniform1iv = function(location,v) {
	snow.platform.web.render.opengl.GL.current_context.uniform1iv(location,v);
};
snow.platform.web.render.opengl.GL.uniform2f = function(location,x,y) {
	snow.platform.web.render.opengl.GL.current_context.uniform2f(location,x,y);
};
snow.platform.web.render.opengl.GL.uniform2fv = function(location,v) {
	snow.platform.web.render.opengl.GL.current_context.uniform2fv(location,v);
};
snow.platform.web.render.opengl.GL.uniform2i = function(location,x,y) {
	snow.platform.web.render.opengl.GL.current_context.uniform2i(location,x,y);
};
snow.platform.web.render.opengl.GL.uniform2iv = function(location,v) {
	snow.platform.web.render.opengl.GL.current_context.uniform2iv(location,v);
};
snow.platform.web.render.opengl.GL.uniform3f = function(location,x,y,z) {
	snow.platform.web.render.opengl.GL.current_context.uniform3f(location,x,y,z);
};
snow.platform.web.render.opengl.GL.uniform3fv = function(location,v) {
	snow.platform.web.render.opengl.GL.current_context.uniform3fv(location,v);
};
snow.platform.web.render.opengl.GL.uniform3i = function(location,x,y,z) {
	snow.platform.web.render.opengl.GL.current_context.uniform3i(location,x,y,z);
};
snow.platform.web.render.opengl.GL.uniform3iv = function(location,v) {
	snow.platform.web.render.opengl.GL.current_context.uniform3iv(location,v);
};
snow.platform.web.render.opengl.GL.uniform4f = function(location,x,y,z,w) {
	snow.platform.web.render.opengl.GL.current_context.uniform4f(location,x,y,z,w);
};
snow.platform.web.render.opengl.GL.uniform4fv = function(location,v) {
	snow.platform.web.render.opengl.GL.current_context.uniform4fv(location,v);
};
snow.platform.web.render.opengl.GL.uniform4i = function(location,x,y,z,w) {
	snow.platform.web.render.opengl.GL.current_context.uniform4i(location,x,y,z,w);
};
snow.platform.web.render.opengl.GL.uniform4iv = function(location,v) {
	snow.platform.web.render.opengl.GL.current_context.uniform4iv(location,v);
};
snow.platform.web.render.opengl.GL.uniformMatrix2fv = function(location,transpose,v) {
	snow.platform.web.render.opengl.GL.current_context.uniformMatrix2fv(location,transpose,v);
};
snow.platform.web.render.opengl.GL.uniformMatrix3fv = function(location,transpose,v) {
	snow.platform.web.render.opengl.GL.current_context.uniformMatrix3fv(location,transpose,v);
};
snow.platform.web.render.opengl.GL.uniformMatrix4fv = function(location,transpose,v) {
	snow.platform.web.render.opengl.GL.current_context.uniformMatrix4fv(location,transpose,v);
};
snow.platform.web.render.opengl.GL.useProgram = function(program) {
	snow.platform.web.render.opengl.GL.current_context.useProgram(program);
};
snow.platform.web.render.opengl.GL.validateProgram = function(program) {
	snow.platform.web.render.opengl.GL.current_context.validateProgram(program);
};
snow.platform.web.render.opengl.GL.vertexAttrib1f = function(indx,x) {
	snow.platform.web.render.opengl.GL.current_context.vertexAttrib1f(indx,x);
};
snow.platform.web.render.opengl.GL.vertexAttrib1fv = function(indx,values) {
	snow.platform.web.render.opengl.GL.current_context.vertexAttrib1fv(indx,values);
};
snow.platform.web.render.opengl.GL.vertexAttrib2f = function(indx,x,y) {
	snow.platform.web.render.opengl.GL.current_context.vertexAttrib2f(indx,x,y);
};
snow.platform.web.render.opengl.GL.vertexAttrib2fv = function(indx,values) {
	snow.platform.web.render.opengl.GL.current_context.vertexAttrib2fv(indx,values);
};
snow.platform.web.render.opengl.GL.vertexAttrib3f = function(indx,x,y,z) {
	snow.platform.web.render.opengl.GL.current_context.vertexAttrib3f(indx,x,y,z);
};
snow.platform.web.render.opengl.GL.vertexAttrib3fv = function(indx,values) {
	snow.platform.web.render.opengl.GL.current_context.vertexAttrib3fv(indx,values);
};
snow.platform.web.render.opengl.GL.vertexAttrib4f = function(indx,x,y,z,w) {
	snow.platform.web.render.opengl.GL.current_context.vertexAttrib4f(indx,x,y,z,w);
};
snow.platform.web.render.opengl.GL.vertexAttrib4fv = function(indx,values) {
	snow.platform.web.render.opengl.GL.current_context.vertexAttrib4fv(indx,values);
};
snow.platform.web.render.opengl.GL.vertexAttribPointer = function(indx,size,type,normalized,stride,offset) {
	snow.platform.web.render.opengl.GL.current_context.vertexAttribPointer(indx,size,type,normalized,stride,offset);
};
snow.platform.web.render.opengl.GL.viewport = function(x,y,width,height) {
	snow.platform.web.render.opengl.GL.current_context.viewport(x,y,width,height);
};
snow.platform.web.render.opengl.GL.get_version = function() {
	return 7938;
};
snow.platform.web.utils = {};
snow.platform.web.utils.ByteArray = function() {
	this.littleEndian = false;
	this.allocated = 0;
	this.position = 0;
	this.length = 0;
	this._snowResizeBuffer(this.allocated);
};
$hxClasses["snow.platform.web.utils.ByteArray"] = snow.platform.web.utils.ByteArray;
snow.platform.web.utils.ByteArray.__name__ = true;
snow.platform.web.utils.ByteArray.toBytes = function(ba) {
	if(ba == null) return null;
	var bytes = haxe.io.Bytes.alloc(ba.length);
	ba.position = 0;
	var _g1 = 0;
	var _g = bytes.length;
	while(_g1 < _g) {
		var _i = _g1++;
		bytes.set(_i,ba.readUnsignedByte());
	}
	ba.position = 0;
	return bytes;
};
snow.platform.web.utils.ByteArray.fromBytes = function(inBytes) {
	var result = new snow.platform.web.utils.ByteArray();
	result.byteView = new Uint8Array(inBytes.b);
	result.set_length(result.byteView.length);
	result.allocated = result.length;
	return result;
};
snow.platform.web.utils.ByteArray.snowOfBuffer = function(buffer) {
	var bytes = new snow.platform.web.utils.ByteArray();
	bytes.set_length(buffer.byteLength);
	bytes.data = new DataView(buffer);
	bytes.byteView = new Uint8Array(buffer);
	return bytes;
};
snow.platform.web.utils.ByteArray.readFile = function(_path,async,onload) {
	if(async == null) async = false;
	var request = new XMLHttpRequest();
	request.open("GET",_path,async);
	request.overrideMimeType("text/plain; charset=x-user-defined");
	if(async) request.responseType = "arraybuffer";
	var result = null;
	var finalized = false;
	var finalize = function() {
		if(!finalized) {
			if(!async) {
				result = new snow.platform.web.utils.ByteArray();
				result.writeUTFBytes(request.response);
				result.position = 0;
			} else result = snow.platform.web.utils.ByteArray.snowOfBuffer(request.response);
		}
		return result;
	};
	request.onload = function(data) {
		if(onload != null) {
			if(request.status == 200) onload(finalize()); else onload(null);
		}
	};
	request.send();
	if(!async) {
		if(request.status == 200) return finalize(); else return null;
	}
	return null;
};
snow.platform.web.utils.ByteArray.prototype = {
	__get: function(pos) {
		return this.data.getUint8(pos);
	}
	,__set: function(pos,v) {
		this.data.setUint8(pos,v);
	}
	,_getUTFBytesCount: function(value) {
		var count = 0;
		var _g1 = 0;
		var _g = value.length;
		while(_g1 < _g) {
			var i = _g1++;
			var c = value.charCodeAt(i);
			if(c <= 127) count += 1; else if(c <= 2047) count += 2; else if(c <= 65535) count += 3; else count += 4;
		}
		return count;
	}
	,_snowResizeBuffer: function(len) {
		var oldByteView = this.byteView;
		var newByteView = new Uint8Array(len);
		if(oldByteView != null) {
			if(oldByteView.length <= len) newByteView.set(oldByteView); else newByteView.set(oldByteView.subarray(0,len));
		}
		this.byteView = newByteView;
		this.data = new DataView(newByteView.buffer);
	}
	,clear: function() {
		if(this.allocated < 0) this._snowResizeBuffer(this.allocated = Std["int"](Math.max(0,this.allocated * 2))); else if(this.allocated > 0) this._snowResizeBuffer(this.allocated = 0);
		this.length = 0;
		0;
	}
	,getData: function() {
		return this.data.buffer;
	}
	,snowFromBytes: function(inBytes) {
		this.byteView = new Uint8Array(inBytes.b);
		this.set_length(this.byteView.length);
		this.allocated = this.length;
	}
	,snowGet: function(pos) {
		var data = this.data;
		return data.getUint8(pos);
	}
	,snowGetBuffer: function() {
		return this.data.buffer;
	}
	,snowSet: function(pos,v) {
		var data = this.data;
		data.setUint8(pos,v);
	}
	,readBoolean: function() {
		return this.readByte() != 0;
	}
	,readByte: function() {
		var data = this.data;
		return data.getUint8(this.position++);
	}
	,readBytes: function(bytes,offset,length) {
		if(offset < 0 || length < 0) throw "Read error - Out of bounds";
		if(offset == null) offset = 0;
		if(length == null) length = this.length;
		var lengthToEnsure = offset + length;
		if(bytes.length < lengthToEnsure) {
			if(bytes.allocated < lengthToEnsure) bytes._snowResizeBuffer(bytes.allocated = Std["int"](Math.max(lengthToEnsure,bytes.allocated * 2))); else if(bytes.allocated > lengthToEnsure) bytes._snowResizeBuffer(bytes.allocated = lengthToEnsure);
			bytes.length = lengthToEnsure;
			lengthToEnsure;
		}
		bytes.byteView.set(this.byteView.subarray(this.position,this.position + length),offset);
		bytes.position = offset;
		this.position += length;
		if(bytes.position + length > bytes.length) bytes.set_length(bytes.position + length);
	}
	,readDouble: function() {
		var $double = this.data.getFloat64(this.position,this.littleEndian);
		this.position += 8;
		return $double;
	}
	,readFloat: function() {
		var $float = this.data.getFloat32(this.position,this.littleEndian);
		this.position += 4;
		return $float;
	}
	,readFullBytes: function(bytes,pos,len) {
		if(this.length < len) {
			if(this.allocated < len) this._snowResizeBuffer(this.allocated = Std["int"](Math.max(len,this.allocated * 2))); else if(this.allocated > len) this._snowResizeBuffer(this.allocated = len);
			this.length = len;
			len;
		}
		var _g1 = pos;
		var _g = pos + len;
		while(_g1 < _g) {
			var i = _g1++;
			var data = this.data;
			data.setInt8(this.position++,bytes.b[i]);
		}
	}
	,readInt: function() {
		var $int = this.data.getInt32(this.position,this.littleEndian);
		this.position += 4;
		return $int;
	}
	,readShort: function() {
		var $short = this.data.getInt16(this.position,this.littleEndian);
		this.position += 2;
		return $short;
	}
	,readUnsignedByte: function() {
		var data = this.data;
		return data.getUint8(this.position++);
	}
	,readUnsignedInt: function() {
		var uInt = this.data.getUint32(this.position,this.littleEndian);
		this.position += 4;
		return uInt;
	}
	,readUnsignedShort: function() {
		var uShort = this.data.getUint16(this.position,this.littleEndian);
		this.position += 2;
		return uShort;
	}
	,readUTF: function() {
		var bytesCount = this.readUnsignedShort();
		return this.readUTFBytes(bytesCount);
	}
	,readUTFBytes: function(len) {
		var value = "";
		var max = this.position + len;
		while(this.position < max) {
			var data = this.data;
			var c = data.getUint8(this.position++);
			if(c < 128) {
				if(c == 0) break;
				value += String.fromCharCode(c);
			} else if(c < 224) value += String.fromCharCode((c & 63) << 6 | data.getUint8(this.position++) & 127); else if(c < 240) {
				var c2 = data.getUint8(this.position++);
				value += String.fromCharCode((c & 31) << 12 | (c2 & 127) << 6 | data.getUint8(this.position++) & 127);
			} else {
				var c21 = data.getUint8(this.position++);
				var c3 = data.getUint8(this.position++);
				value += String.fromCharCode((c & 15) << 18 | (c21 & 127) << 12 | c3 << 6 & 127 | data.getUint8(this.position++) & 127);
			}
		}
		return value;
	}
	,toString: function() {
		var cachePosition = this.position;
		this.position = 0;
		var value = this.readUTFBytes(this.length);
		this.position = cachePosition;
		return value;
	}
	,writeBoolean: function(value) {
		this.writeByte(value?1:0);
	}
	,writeByte: function(value) {
		var lengthToEnsure = this.position + 1;
		if(this.length < lengthToEnsure) {
			if(this.allocated < lengthToEnsure) this._snowResizeBuffer(this.allocated = Std["int"](Math.max(lengthToEnsure,this.allocated * 2))); else if(this.allocated > lengthToEnsure) this._snowResizeBuffer(this.allocated = lengthToEnsure);
			this.length = lengthToEnsure;
			lengthToEnsure;
		}
		var data = this.data;
		data.setInt8(this.position,value);
		this.position += 1;
	}
	,writeBytes: function(bytes,offset,length) {
		if(offset < 0 || length < 0) throw "Write error - Out of bounds";
		var lengthToEnsure = this.position + length;
		if(this.length < lengthToEnsure) {
			if(this.allocated < lengthToEnsure) this._snowResizeBuffer(this.allocated = Std["int"](Math.max(lengthToEnsure,this.allocated * 2))); else if(this.allocated > lengthToEnsure) this._snowResizeBuffer(this.allocated = lengthToEnsure);
			this.length = lengthToEnsure;
			lengthToEnsure;
		}
		this.byteView.set(bytes.byteView.subarray(offset,offset + length),this.position);
		this.position += length;
	}
	,writeDouble: function(x) {
		var lengthToEnsure = this.position + 8;
		if(this.length < lengthToEnsure) {
			if(this.allocated < lengthToEnsure) this._snowResizeBuffer(this.allocated = Std["int"](Math.max(lengthToEnsure,this.allocated * 2))); else if(this.allocated > lengthToEnsure) this._snowResizeBuffer(this.allocated = lengthToEnsure);
			this.length = lengthToEnsure;
			lengthToEnsure;
		}
		this.data.setFloat64(this.position,x,this.littleEndian);
		this.position += 8;
	}
	,writeFloat: function(x) {
		var lengthToEnsure = this.position + 4;
		if(this.length < lengthToEnsure) {
			if(this.allocated < lengthToEnsure) this._snowResizeBuffer(this.allocated = Std["int"](Math.max(lengthToEnsure,this.allocated * 2))); else if(this.allocated > lengthToEnsure) this._snowResizeBuffer(this.allocated = lengthToEnsure);
			this.length = lengthToEnsure;
			lengthToEnsure;
		}
		this.data.setFloat32(this.position,x,this.littleEndian);
		this.position += 4;
	}
	,writeInt: function(value) {
		var lengthToEnsure = this.position + 4;
		if(this.length < lengthToEnsure) {
			if(this.allocated < lengthToEnsure) this._snowResizeBuffer(this.allocated = Std["int"](Math.max(lengthToEnsure,this.allocated * 2))); else if(this.allocated > lengthToEnsure) this._snowResizeBuffer(this.allocated = lengthToEnsure);
			this.length = lengthToEnsure;
			lengthToEnsure;
		}
		this.data.setInt32(this.position,value,this.littleEndian);
		this.position += 4;
	}
	,writeShort: function(value) {
		var lengthToEnsure = this.position + 2;
		if(this.length < lengthToEnsure) {
			if(this.allocated < lengthToEnsure) this._snowResizeBuffer(this.allocated = Std["int"](Math.max(lengthToEnsure,this.allocated * 2))); else if(this.allocated > lengthToEnsure) this._snowResizeBuffer(this.allocated = lengthToEnsure);
			this.length = lengthToEnsure;
			lengthToEnsure;
		}
		this.data.setInt16(this.position,value,this.littleEndian);
		this.position += 2;
	}
	,writeUnsignedInt: function(value) {
		var lengthToEnsure = this.position + 4;
		if(this.length < lengthToEnsure) {
			if(this.allocated < lengthToEnsure) this._snowResizeBuffer(this.allocated = Std["int"](Math.max(lengthToEnsure,this.allocated * 2))); else if(this.allocated > lengthToEnsure) this._snowResizeBuffer(this.allocated = lengthToEnsure);
			this.length = lengthToEnsure;
			lengthToEnsure;
		}
		this.data.setUint32(this.position,value,this.littleEndian);
		this.position += 4;
	}
	,writeUnsignedShort: function(value) {
		var lengthToEnsure = this.position + 2;
		if(this.length < lengthToEnsure) {
			if(this.allocated < lengthToEnsure) this._snowResizeBuffer(this.allocated = Std["int"](Math.max(lengthToEnsure,this.allocated * 2))); else if(this.allocated > lengthToEnsure) this._snowResizeBuffer(this.allocated = lengthToEnsure);
			this.length = lengthToEnsure;
			lengthToEnsure;
		}
		this.data.setUint16(this.position,value,this.littleEndian);
		this.position += 2;
	}
	,writeUTF: function(value) {
		this.writeUnsignedShort(this._getUTFBytesCount(value));
		this.writeUTFBytes(value);
	}
	,writeUTFBytes: function(value) {
		var _g1 = 0;
		var _g = value.length;
		while(_g1 < _g) {
			var i = _g1++;
			var c = value.charCodeAt(i);
			if(c <= 127) this.writeByte(c); else if(c <= 2047) {
				this.writeByte(192 | c >> 6);
				this.writeByte(128 | c & 63);
			} else if(c <= 65535) {
				this.writeByte(224 | c >> 12);
				this.writeByte(128 | c >> 6 & 63);
				this.writeByte(128 | c & 63);
			} else {
				this.writeByte(240 | c >> 18);
				this.writeByte(128 | c >> 12 & 63);
				this.writeByte(128 | c >> 6 & 63);
				this.writeByte(128 | c & 63);
			}
		}
	}
	,get_bytesAvailable: function() {
		return this.length - this.position;
	}
	,get_endian: function() {
		if(this.littleEndian) return "littleEndian"; else return "bigEndian";
	}
	,set_endian: function(endian) {
		this.littleEndian = endian == "littleEndian";
		return endian;
	}
	,set_length: function(value) {
		if(this.allocated < value) this._snowResizeBuffer(this.allocated = Std["int"](Math.max(value,this.allocated * 2))); else if(this.allocated > value) this._snowResizeBuffer(this.allocated = value);
		this.length = value;
		return value;
	}
	,__class__: snow.platform.web.utils.ByteArray
};
snow.window = {};
snow.window.WindowSystemBinding = function() { };
$hxClasses["snow.window.WindowSystemBinding"] = snow.window.WindowSystemBinding;
snow.window.WindowSystemBinding.__name__ = true;
snow.window.WindowSystemBinding.__interfaces__ = [snow.utils.AbstractClass];
snow.window.WindowSystemBinding.prototype = {
	init: function() {
		throw "abstract method, must override";
	}
	,process: function() {
		throw "abstract method, must override";
	}
	,destroy: function() {
		throw "abstract method, must override";
	}
	,listen: function(window) {
		throw "abstract method, must override";
	}
	,unlisten: function(window) {
		throw "abstract method, must override";
	}
	,create: function(render_config,config,on_created) {
		throw "abstract method, must override";
	}
	,close: function(window) {
		throw "abstract method, must override";
	}
	,show: function(window) {
		throw "abstract method, must override";
	}
	,destroy_window: function(window) {
		throw "abstract method, must override";
	}
	,update: function(window) {
		throw "abstract method, must override";
	}
	,render: function(window) {
		throw "abstract method, must override";
	}
	,swap: function(window) {
		throw "abstract method, must override";
	}
	,simple_message: function(window,message,title) {
		if(title == null) title = "";
		throw "abstract method, must override";
	}
	,set_size: function(window,w,h) {
		throw "abstract method, must override";
	}
	,set_position: function(window,x,y) {
		throw "abstract method, must override";
	}
	,set_title: function(window,title) {
		throw "abstract method, must override";
	}
	,set_max_size: function(window,w,h) {
		throw "abstract method, must override";
	}
	,set_min_size: function(window,w,h) {
		throw "abstract method, must override";
	}
	,fullscreen: function(window,fullscreen) {
		throw "abstract method, must override";
	}
	,bordered: function(window,bordered) {
		throw "abstract method, must override";
	}
	,grab: function(window,grabbed) {
		throw "abstract method, must override";
	}
	,set_cursor_position: function(window,x,y) {
		throw "abstract method, must override";
	}
	,system_enable_cursor: function(enable) {
		throw "abstract method, must override";
	}
	,system_lock_cursor: function(enable) {
		throw "abstract method, must override";
	}
	,system_enable_vsync: function(enable) {
		throw "abstract method, must override";
	}
	,display_count: function() {
		throw "abstract method, must override";
	}
	,display_mode_count: function(display) {
		throw "abstract method, must override";
	}
	,display_native_mode: function(display) {
		throw "abstract method, must override";
	}
	,display_current_mode: function(display) {
		throw "abstract method, must override";
	}
	,display_mode: function(display,mode_index) {
		throw "abstract method, must override";
	}
	,display_bounds: function(display) {
		throw "abstract method, must override";
	}
	,display_name: function(display) {
		throw "abstract method, must override";
	}
	,__class__: snow.window.WindowSystemBinding
};
snow.platform.web.window = {};
snow.platform.web.window.WindowSystem = function(_manager,_lib) {
	this._hidden_event_name = "";
	this._hidden_name = "";
	this._cursor_visible = true;
	this._pre_fs_height = 0;
	this._pre_fs_width = 0;
	this._pre_fs_s_height = "";
	this._pre_fs_s_width = "";
	this._pre_fs_margin = "0";
	this._pre_fs_padding = "0";
	this.seq_window = 1;
	this.manager = _manager;
	this.lib = _lib;
	this.gl_contexts = new haxe.ds.IntMap();
};
$hxClasses["snow.platform.web.window.WindowSystem"] = snow.platform.web.window.WindowSystem;
snow.platform.web.window.WindowSystem.__name__ = true;
snow.platform.web.window.WindowSystem.__super__ = snow.window.WindowSystemBinding;
snow.platform.web.window.WindowSystem.prototype = $extend(snow.window.WindowSystemBinding.prototype,{
	init: function() {
		this.listen_for_visibility();
	}
	,process: function() {
	}
	,destroy: function() {
	}
	,create: function(render_config,config,on_created) {
		var _window_id = this.seq_window;
		var _handle;
		var _this = window.document;
		_handle = _this.createElement("canvas");
		_handle.width = config.width;
		_handle.height = config.height;
		_handle.style.display = "block";
		_handle.style.position = "relative";
		_handle.style.background = "#000";
		window.document.body.appendChild(_handle);
		var _gl_context = js.html._CanvasElement.CanvasUtil.getContextWebGL(_handle,{ alpha : false, premultipliedAlpha : false});
		if(_gl_context == null) {
			var msg = "WebGL is required to run this!<br/><br/>";
			msg += "visit http://get.webgl.org/ for help <br/>";
			msg += "and contact the developer of the application";
			this.internal_fallback(msg);
			throw msg;
		}
		if(snow.platform.web.render.opengl.GL.current_context == null) snow.platform.web.render.opengl.GL.current_context = _gl_context;
		this.gl_contexts.set(_window_id,_gl_context);
		var _window_pos = this.get_real_window_position(_handle);
		config.x = _window_pos.x;
		config.y = _window_pos.y;
		if(config.title != null && config.title != "") window.document.title = config.title;
		if(config.fullscreen) this.internal_fullscreen(_handle,config.fullscreen);
		on_created(_handle,_window_id,{ config : config, render_config : render_config});
		_handle.setAttribute("id","window" + _window_id);
		this.seq_window++;
	}
	,destroy_window: function(_window) {
		window.document.body.removeChild(_window.handle);
	}
	,close: function(_window) {
		_window.handle.style.display = "none";
	}
	,show: function(_window) {
		_window.handle.style.display = null;
	}
	,update: function(_window) {
		var _rect = _window.handle.getBoundingClientRect();
		if(_rect.left != _window.x || _rect.top != _window.y) this.lib.dispatch_system_event({ type : 5, window : { type : 5, timestamp : snow.Snow.core.timestamp(), window_id : _window.id, event : { x : _rect.left, y : _rect.top}}}); else if(_rect.width != _window.width || _rect.height != _window.height) this.lib.dispatch_system_event({ type : 5, window : { type : 7, timestamp : snow.Snow.core.timestamp(), window_id : _window.id, event : { x : _rect.width, y : _rect.height}}});
		_rect = null;
	}
	,render: function(_window) {
		var _window_gl_context = this.gl_contexts.get(_window.id);
		if(snow.platform.web.render.opengl.GL.current_context != _window_gl_context) snow.platform.web.render.opengl.GL.current_context = _window_gl_context;
	}
	,swap: function(_window) {
	}
	,simple_message: function(_window,message,title) {
		if(title == null) title = "";
		window.alert(message);
	}
	,set_size: function(_window,w,h) {
		_window.handle.style.width = "" + w + "px";
		_window.handle.style.height = "" + h + "px";
	}
	,set_position: function(_window,x,y) {
		_window.handle.style.left = "" + x + "px";
		_window.handle.style.top = "" + y + "px";
	}
	,get_real_window_position: function(handle) {
		var curleft = 0;
		var curtop = 0;
		var _obj = handle;
		var _has_parent = true;
		var _max_count = 0;
		while(_has_parent == true) {
			_max_count++;
			if(_max_count > 100) {
				_has_parent = false;
				break;
			}
			if(_obj.offsetParent != null) {
				curleft += _obj.offsetLeft;
				curtop += _obj.offsetTop;
				_obj = _obj.offsetParent;
			} else _has_parent = false;
		}
		return { x : curleft, y : curtop};
	}
	,set_title: function(_window,title) {
		window.document.title = title;
	}
	,set_max_size: function(_window,w,h) {
		_window.handle.style.maxWidth = "" + w + "px";
		_window.handle.style.maxHeight = "" + h + "px";
	}
	,set_min_size: function(_window,w,h) {
		_window.handle.style.minWidth = "" + w + "px";
		_window.handle.style.minHeight = "" + h + "px";
	}
	,internal_fullscreen: function(_handle,fullscreen) {
		var true_fullscreen = this.lib.config.web.true_fullscreen;
		if(fullscreen) {
			if(true_fullscreen) {
				if($bind(_handle,_handle.requestFullscreen) == null) {
					if($bind(_handle,_handle.requestFullScreen) == null) {
						if(_handle.webkitRequestFullscreen == null) {
							if(_handle.mozRequestFullScreen == null) {
							} else _handle.mozRequestFullScreen();
						} else _handle.webkitRequestFullscreen();
					} else _handle.requestFullScreen(0);
				} else _handle.requestFullscreen();
			} else {
				this._pre_fs_padding = _handle.style.padding;
				this._pre_fs_margin = _handle.style.margin;
				this._pre_fs_s_width = _handle.style.width;
				this._pre_fs_s_height = _handle.style.height;
				this._pre_fs_width = _handle.width;
				this._pre_fs_height = _handle.height;
				_handle.style.margin = "0";
				_handle.style.padding = "0";
				_handle.style.width = window.innerWidth + "px";
				_handle.style.height = window.innerHeight + "px";
				_handle.width = window.innerWidth;
				_handle.height = window.innerHeight;
			}
		} else if(!true_fullscreen) {
		} else {
			_handle.style.padding = this._pre_fs_padding;
			_handle.style.margin = this._pre_fs_margin;
			_handle.style.width = this._pre_fs_s_width;
			_handle.style.height = this._pre_fs_s_height;
			_handle.width = this._pre_fs_width;
			_handle.height = this._pre_fs_height;
		}
	}
	,fullscreen: function(_window,fullscreen) {
		this.internal_fullscreen(_window.handle,fullscreen);
	}
	,bordered: function(_window,bordered) {
	}
	,grab: function(_window,grabbed) {
		if(grabbed) {
			if(($_=_window.handle,$bind($_,$_.requestPointerLock)) == null) {
				if(_window.handle.webkitRequestPointerLock == null) {
					if(_window.handle.mozRequestPointerLock == null) {
					} else _window.handle.mozRequestPointerLock();
				} else _window.handle.webkitRequestPointerLock();
			} else _window.handle.requestPointerLock();
		} else {
		}
	}
	,set_cursor_position: function(_window,x,y) {
	}
	,system_enable_cursor: function(enable) {
		if(this.cursor_style == null) {
			var _this = window.document;
			this.cursor_style = _this.createElement("style");
			this.cursor_style.innerHTML = "* { cursor:none; }";
		}
		if(enable && !this._cursor_visible) {
			this._cursor_visible = true;
			window.document.body.removeChild(this.cursor_style);
		} else if(!enable && this._cursor_visible) {
			this._cursor_visible = false;
			window.document.body.appendChild(this.cursor_style);
		}
	}
	,system_lock_cursor: function(enable) {
		if(this.lib.window != null) this.grab(this.lib.window,enable);
	}
	,system_enable_vsync: function(enable) {
		return -1;
	}
	,display_count: function() {
		return 1;
	}
	,display_mode_count: function(display) {
		return 1;
	}
	,display_native_mode: function(display) {
		return { format : 0, refresh_rate : 0, width : window.screen.width, height : window.screen.height};
	}
	,display_current_mode: function(display) {
		return this.display_native_mode(display);
	}
	,display_mode: function(display,mode_index) {
		return this.display_native_mode(display);
	}
	,display_bounds: function(display) {
		return { x : 0, y : 0, width : window.innerWidth, height : window.innerHeight};
	}
	,display_name: function(display) {
		return window.navigator.vendor;
	}
	,listen: function(_window) {
		_window.handle.addEventListener("mouseleave",$bind(this,this.on_internal_leave));
		_window.handle.addEventListener("mouseenter",$bind(this,this.on_internal_enter));
	}
	,unlisten: function(_window) {
		_window.handle.removeEventListener("mouseleave",$bind(this,this.on_internal_leave));
		_window.handle.removeEventListener("mouseenter",$bind(this,this.on_internal_enter));
	}
	,on_internal_leave: function(_mouse_event) {
		var _window = this.lib.windowing.window_from_handle(_mouse_event.target);
		this.lib.dispatch_system_event({ type : 5, window : { type : 12, timestamp : _mouse_event.timeStamp, window_id : _window.id, event : _mouse_event}});
	}
	,on_internal_enter: function(_mouse_event) {
		var _window = this.lib.windowing.window_from_handle(_mouse_event.target);
		this.lib.dispatch_system_event({ type : 5, window : { type : 11, timestamp : _mouse_event.timeStamp, window_id : _window.id, event : _mouse_event}});
	}
	,listen_for_visibility: function() {
		if(typeof document.hidden !== undefined) {
			this._hidden_name = "hidden";
			this._hidden_event_name = "visibilitychange";
		} else if(typeof document.mozHidden !== undefined ) {
			this._hidden_name = "mozHidden";
			this._hidden_name = "mozvisibilitychange";
		} else if(typeof document.msHidden !== "undefined") {
			this._hidden_name = "msHidden";
			this._hidden_event_name = "msvisibilitychange";
		} else if(typeof document.webkitHidden !== "undefined") {
			this._hidden_name = "webkitHidden";
			this._hidden_event_name = "webkitvisibilitychange";
		}
		if(this._hidden_name != "" && this._hidden_event_name != "") window.document.addEventListener(this._hidden_event_name,$bind(this,this.on_visibility_change));
	}
	,on_visibility_change: function(jsevent) {
		var _event = { type : 5, window : { type : 2, timestamp : snow.Snow.core.timestamp(), window_id : 1, event : jsevent}};
		if(document[this._hidden_name]) {
			_event.window.type = 3;
			this.lib.dispatch_system_event(_event);
			_event.window.type = 8;
			this.lib.dispatch_system_event(_event);
			_event.window.type = 14;
			this.lib.dispatch_system_event(_event);
		} else {
			_event.window.type = 2;
			this.lib.dispatch_system_event(_event);
			_event.window.type = 10;
			this.lib.dispatch_system_event(_event);
			_event.window.type = 13;
			this.lib.dispatch_system_event(_event);
		}
	}
	,internal_fallback: function(message) {
		var text_el;
		var overlay_el;
		var _this = window.document;
		text_el = _this.createElement("div");
		var _this1 = window.document;
		overlay_el = _this1.createElement("div");
		text_el.style.marginLeft = "auto";
		text_el.style.marginRight = "auto";
		text_el.style.color = "#d3d3d3";
		text_el.style.marginTop = "5em";
		text_el.style.fontSize = "1.4em";
		text_el.style.fontFamily = "helvetica,sans-serif";
		text_el.innerHTML = message;
		overlay_el.style.top = "0";
		overlay_el.style.left = "0";
		overlay_el.style.width = "100%";
		overlay_el.style.height = "100%";
		overlay_el.style.display = "block";
		overlay_el.style.minWidth = "100%";
		overlay_el.style.minHeight = "100%";
		overlay_el.style.textAlign = "center";
		overlay_el.style.position = "absolute";
		overlay_el.style.background = "rgba(1,1,1,0.90)";
		overlay_el.appendChild(text_el);
		window.document.body.appendChild(overlay_el);
	}
	,__class__: snow.platform.web.window.WindowSystem
});
snow.types = {};
snow.types._Types = {};
snow.types._Types.AssetType_Impl_ = function() { };
$hxClasses["snow.types._Types.AssetType_Impl_"] = snow.types._Types.AssetType_Impl_;
snow.types._Types.AssetType_Impl_.__name__ = true;
snow.types._Types.AudioFormatType_Impl_ = function() { };
$hxClasses["snow.types._Types.AudioFormatType_Impl_"] = snow.types._Types.AudioFormatType_Impl_;
snow.types._Types.AudioFormatType_Impl_.__name__ = true;
snow.types._Types.OpenGLProfile_Impl_ = function() { };
$hxClasses["snow.types._Types.OpenGLProfile_Impl_"] = snow.types._Types.OpenGLProfile_Impl_;
snow.types._Types.OpenGLProfile_Impl_.__name__ = true;
snow.types._Types.TextEventType_Impl_ = function() { };
$hxClasses["snow.types._Types.TextEventType_Impl_"] = snow.types._Types.TextEventType_Impl_;
snow.types._Types.TextEventType_Impl_.__name__ = true;
snow.types._Types.GamepadDeviceEventType_Impl_ = function() { };
$hxClasses["snow.types._Types.GamepadDeviceEventType_Impl_"] = snow.types._Types.GamepadDeviceEventType_Impl_;
snow.types._Types.GamepadDeviceEventType_Impl_.__name__ = true;
snow.types._Types.SystemEventType_Impl_ = function() { };
$hxClasses["snow.types._Types.SystemEventType_Impl_"] = snow.types._Types.SystemEventType_Impl_;
snow.types._Types.SystemEventType_Impl_.__name__ = true;
snow.types._Types.WindowEventType_Impl_ = function() { };
$hxClasses["snow.types._Types.WindowEventType_Impl_"] = snow.types._Types.WindowEventType_Impl_;
snow.types._Types.WindowEventType_Impl_.__name__ = true;
snow.types._Types.InputEventType_Impl_ = function() { };
$hxClasses["snow.types._Types.InputEventType_Impl_"] = snow.types._Types.InputEventType_Impl_;
snow.types._Types.InputEventType_Impl_.__name__ = true;
snow.types._Types.FileEventType_Impl_ = function() { };
$hxClasses["snow.types._Types.FileEventType_Impl_"] = snow.types._Types.FileEventType_Impl_;
snow.types._Types.FileEventType_Impl_.__name__ = true;
snow.utils.AbstractClassBuilder = function() { };
$hxClasses["snow.utils.AbstractClassBuilder"] = snow.utils.AbstractClassBuilder;
snow.utils.AbstractClassBuilder.__name__ = true;
snow.utils.Libs = function() { };
$hxClasses["snow.utils.Libs"] = snow.utils.Libs;
snow.utils.Libs.__name__ = true;
snow.utils.Libs.tryLoad = function(name,library,func,args) {
	return null;
};
snow.utils.Libs.findHaxeLib = function(library) {
	try {
	} catch( e ) {
	}
	return "";
};
snow.utils.Libs.get_system_name = function() {
	return window.navigator.userAgent;
	return "unknown";
};
snow.utils.Libs.web_add_lib = function(library,root) {
	if(snow.utils.Libs._web_libs == null) snow.utils.Libs._web_libs = new haxe.ds.StringMap();
	var value = root;
	snow.utils.Libs._web_libs.set(library,value);
	return true;
};
snow.utils.Libs.web_lib_load = function(library,method) {
	if(snow.utils.Libs._web_libs == null) snow.utils.Libs._web_libs = new haxe.ds.StringMap();
	var _root = snow.utils.Libs._web_libs.get(library);
	if(_root != null) return Reflect.field(_root,method);
	return null;
};
snow.utils.Libs.load = function(library,method,args) {
	if(args == null) args = 0;
	var found_in_web_libs = snow.utils.Libs.web_lib_load(library,method);
	if(found_in_web_libs) return found_in_web_libs;
	if(snow.utils.Libs.__moduleNames == null) snow.utils.Libs.__moduleNames = new haxe.ds.StringMap();
	if(snow.utils.Libs.__moduleNames.exists(library)) {
	}
	snow.utils.Libs.__moduleNames.set(library,library);
	var result = snow.utils.Libs.tryLoad("./" + library,library,method,args);
	if(result == null) result = snow.utils.Libs.tryLoad(".\\" + library,library,method,args);
	if(result == null) result = snow.utils.Libs.tryLoad(library,library,method,args);
	if(result == null) {
		var slash;
		if(((function($this) {
			var $r;
			var _this = snow.utils.Libs.get_system_name();
			$r = HxOverrides.substr(_this,7,null);
			return $r;
		}(this))).toLowerCase() == "windows") slash = "\\"; else slash = "/";
		var haxelib = snow.utils.Libs.findHaxeLib("snow");
		if(haxelib != "") {
			result = snow.utils.Libs.tryLoad(haxelib + slash + "ndll" + slash + snow.utils.Libs.get_system_name() + slash + library,library,method,args);
			if(result == null) result = snow.utils.Libs.tryLoad(haxelib + slash + "ndll" + slash + snow.utils.Libs.get_system_name() + "64" + slash + library,library,method,args);
		}
	}
	snow.utils.Libs.loaderTrace("Result : " + Std.string(result));
	return result;
};
snow.utils.Libs.loaderTrace = function(message) {
};
snow.utils.Timer = function(_time) {
	this.time = _time;
	snow.utils.Timer.running_timers.push(this);
	this.fire_at = snow.utils.Timer.stamp() + this.time;
	this.running = true;
};
$hxClasses["snow.utils.Timer"] = snow.utils.Timer;
snow.utils.Timer.__name__ = true;
snow.utils.Timer.measure = function(f,pos) {
	var t0 = snow.utils.Timer.stamp();
	var r = f();
	haxe.Log.trace(snow.utils.Timer.stamp() - t0 + "s",pos);
	return r;
};
snow.utils.Timer.update = function() {
	var now = snow.utils.Timer.stamp();
	var _g = 0;
	var _g1 = snow.utils.Timer.running_timers;
	while(_g < _g1.length) {
		var timer = _g1[_g];
		++_g;
		if(timer.running) {
			if(timer.fire_at < now) {
				timer.fire_at += timer.time;
				timer.run();
			}
		}
	}
};
snow.utils.Timer.delay = function(_time,_f) {
	var t = new snow.utils.Timer(_time);
	t.run = function() {
		t.stop();
		_f();
	};
	return t;
};
snow.utils.Timer.stamp = function() {
	return snow.Snow.core.timestamp();
};
snow.utils.Timer.prototype = {
	run: function() {
	}
	,stop: function() {
		if(this.running) {
			this.running = false;
			HxOverrides.remove(snow.utils.Timer.running_timers,this);
		}
	}
	,__class__: snow.utils.Timer
};
snow.utils.format = {};
snow.utils.format.png = {};
snow.utils.format.png.Color = { __ename__ : true, __constructs__ : ["ColGrey","ColTrue","ColIndexed"] };
snow.utils.format.png.Color.ColGrey = function(alpha) { var $x = ["ColGrey",0,alpha]; $x.__enum__ = snow.utils.format.png.Color; $x.toString = $estr; return $x; };
snow.utils.format.png.Color.ColTrue = function(alpha) { var $x = ["ColTrue",1,alpha]; $x.__enum__ = snow.utils.format.png.Color; $x.toString = $estr; return $x; };
snow.utils.format.png.Color.ColIndexed = ["ColIndexed",2];
snow.utils.format.png.Color.ColIndexed.toString = $estr;
snow.utils.format.png.Color.ColIndexed.__enum__ = snow.utils.format.png.Color;
snow.utils.format.png.Color.__empty_constructs__ = [snow.utils.format.png.Color.ColIndexed];
snow.utils.format.png.Chunk = { __ename__ : true, __constructs__ : ["CEnd","CHeader","CData","CPalette","CUnknown"] };
snow.utils.format.png.Chunk.CEnd = ["CEnd",0];
snow.utils.format.png.Chunk.CEnd.toString = $estr;
snow.utils.format.png.Chunk.CEnd.__enum__ = snow.utils.format.png.Chunk;
snow.utils.format.png.Chunk.CHeader = function(h) { var $x = ["CHeader",1,h]; $x.__enum__ = snow.utils.format.png.Chunk; $x.toString = $estr; return $x; };
snow.utils.format.png.Chunk.CData = function(b) { var $x = ["CData",2,b]; $x.__enum__ = snow.utils.format.png.Chunk; $x.toString = $estr; return $x; };
snow.utils.format.png.Chunk.CPalette = function(b) { var $x = ["CPalette",3,b]; $x.__enum__ = snow.utils.format.png.Chunk; $x.toString = $estr; return $x; };
snow.utils.format.png.Chunk.CUnknown = function(id,data) { var $x = ["CUnknown",4,id,data]; $x.__enum__ = snow.utils.format.png.Chunk; $x.toString = $estr; return $x; };
snow.utils.format.png.Chunk.__empty_constructs__ = [snow.utils.format.png.Chunk.CEnd];
snow.utils.format.png.Reader = function(i) {
	this.i = i;
	i.set_bigEndian(true);
	this.checkCRC = true;
};
$hxClasses["snow.utils.format.png.Reader"] = snow.utils.format.png.Reader;
snow.utils.format.png.Reader.__name__ = true;
snow.utils.format.png.Reader.prototype = {
	read: function() {
		var _g = 0;
		var _g1 = [137,80,78,71,13,10,26,10];
		while(_g < _g1.length) {
			var b = _g1[_g];
			++_g;
			if(this.i.readByte() != b) throw "Invalid header";
		}
		var l = new List();
		while(true) {
			var c = this.readChunk();
			l.add(c);
			if(c == snow.utils.format.png.Chunk.CEnd) break;
		}
		return l;
	}
	,readHeader: function(i) {
		i.set_bigEndian(true);
		var width = i.readInt32();
		var height = i.readInt32();
		var colbits = i.readByte();
		var color = i.readByte();
		var color1;
		switch(color) {
		case 0:
			color1 = snow.utils.format.png.Color.ColGrey(false);
			break;
		case 2:
			color1 = snow.utils.format.png.Color.ColTrue(false);
			break;
		case 3:
			color1 = snow.utils.format.png.Color.ColIndexed;
			break;
		case 4:
			color1 = snow.utils.format.png.Color.ColGrey(true);
			break;
		case 6:
			color1 = snow.utils.format.png.Color.ColTrue(true);
			break;
		default:
			throw "Unknown color model " + color + ":" + colbits;
		}
		var compress = i.readByte();
		var filter = i.readByte();
		if(compress != 0 || filter != 0) throw "Invalid header";
		var interlace = i.readByte();
		if(interlace != 0 && interlace != 1) throw "Invalid header";
		return { width : width, height : height, colbits : colbits, color : color1, interlaced : interlace == 1};
	}
	,readChunk: function() {
		var dataLen = this.i.readInt32();
		var id = this.i.readString(4);
		var data = this.i.read(dataLen);
		var crc = this.i.readInt32();
		if(this.checkCRC) {
			var c = new haxe.crypto.Crc32();
			var _g = 0;
			while(_g < 4) {
				var i = _g++;
				c["byte"](HxOverrides.cca(id,i));
			}
			c.update(data,0,data.length);
			if(c.get() != crc) throw "CRC check failure";
		}
		switch(id) {
		case "IEND":
			return snow.utils.format.png.Chunk.CEnd;
		case "IHDR":
			return snow.utils.format.png.Chunk.CHeader(this.readHeader(new haxe.io.BytesInput(data)));
		case "IDAT":
			return snow.utils.format.png.Chunk.CData(data);
		case "PLTE":
			return snow.utils.format.png.Chunk.CPalette(data);
		default:
			return snow.utils.format.png.Chunk.CUnknown(id,data);
		}
	}
	,__class__: snow.utils.format.png.Reader
};
snow.utils.format.png.Tools = function() { };
$hxClasses["snow.utils.format.png.Tools"] = snow.utils.format.png.Tools;
snow.utils.format.png.Tools.__name__ = true;
snow.utils.format.png.Tools.getHeader = function(d) {
	var $it0 = d.iterator();
	while( $it0.hasNext() ) {
		var c = $it0.next();
		switch(c[1]) {
		case 1:
			var h = c[2];
			return h;
		default:
		}
	}
	throw "Header not found";
};
snow.utils.format.png.Tools.getPalette = function(d) {
	var $it0 = d.iterator();
	while( $it0.hasNext() ) {
		var c = $it0.next();
		switch(c[1]) {
		case 3:
			var b = c[2];
			return b;
		default:
		}
	}
	return null;
};
snow.utils.format.png.Tools.filter = function(data,x,y,stride,prev,p,numChannels) {
	if(numChannels == null) numChannels = 4;
	var b;
	if(y == 0) b = 0; else b = data.b[p - stride];
	var c;
	if(x == 0 || y == 0) c = 0; else c = data.b[p - stride - numChannels];
	var k = prev + b - c;
	var pa = k - prev;
	if(pa < 0) pa = -pa;
	var pb = k - b;
	if(pb < 0) pb = -pb;
	var pc = k - c;
	if(pc < 0) pc = -pc;
	if(pa <= pb && pa <= pc) return prev; else if(pb <= pc) return b; else return c;
};
snow.utils.format.png.Tools.reverseBytes = function(b) {
	var p = 0;
	var _g1 = 0;
	var _g = b.length >> 2;
	while(_g1 < _g) {
		var i = _g1++;
		var b1 = b.b[p];
		var g = b.b[p + 1];
		var r = b.b[p + 2];
		var a = b.b[p + 3];
		var p1 = p++;
		b.b[p1] = a & 255;
		var p2 = p++;
		b.b[p2] = r & 255;
		var p3 = p++;
		b.b[p3] = g & 255;
		var p4 = p++;
		b.b[p4] = b1 & 255;
	}
};
snow.utils.format.png.Tools.extractGrey = function(d) {
	var h = snow.utils.format.png.Tools.getHeader(d);
	var grey = haxe.io.Bytes.alloc(h.width * h.height);
	var data = null;
	var fullData = null;
	var $it0 = d.iterator();
	while( $it0.hasNext() ) {
		var c = $it0.next();
		switch(c[1]) {
		case 2:
			var b = c[2];
			if(fullData != null) fullData.add(b); else if(data == null) data = b; else {
				fullData = new haxe.io.BytesBuffer();
				fullData.add(data);
				fullData.add(b);
				data = null;
			}
			break;
		default:
		}
	}
	if(fullData != null) data = fullData.getBytes();
	if(data == null) throw "Data not found";
	data = snow.utils.format.tools.Inflate.run(data);
	var r = 0;
	var w = 0;
	{
		var _g = h.color;
		switch(_g[1]) {
		case 0:
			var alpha = _g[2];
			if(h.colbits != 8) throw "Unsupported color mode";
			var width = h.width;
			var stride;
			stride = (alpha?2:1) * width + 1;
			if(data.length < h.height * stride) throw "Not enough data";
			var rinc;
			if(alpha) rinc = 2; else rinc = 1;
			var _g2 = 0;
			var _g1 = h.height;
			while(_g2 < _g1) {
				var y = _g2++;
				var f = data.get(r++);
				switch(f) {
				case 0:
					var _g3 = 0;
					while(_g3 < width) {
						var x = _g3++;
						var v = data.b[r];
						r += rinc;
						grey.set(w++,v);
					}
					break;
				case 1:
					var cv = 0;
					var _g31 = 0;
					while(_g31 < width) {
						var x1 = _g31++;
						cv += data.b[r];
						r += rinc;
						grey.set(w++,cv);
					}
					break;
				case 2:
					var stride1;
					if(y == 0) stride1 = 0; else stride1 = width;
					var _g32 = 0;
					while(_g32 < width) {
						var x2 = _g32++;
						var v1 = data.b[r] + grey.b[w - stride1];
						r += rinc;
						grey.set(w++,v1);
					}
					break;
				case 3:
					var cv1 = 0;
					var stride2;
					if(y == 0) stride2 = 0; else stride2 = width;
					var _g33 = 0;
					while(_g33 < width) {
						var x3 = _g33++;
						cv1 = data.b[r] + (cv1 + grey.b[w - stride2] >> 1) & 255;
						r += rinc;
						grey.set(w++,cv1);
					}
					break;
				case 4:
					var stride3 = width;
					var cv2 = 0;
					var _g34 = 0;
					while(_g34 < width) {
						var x4 = _g34++;
						cv2 = snow.utils.format.png.Tools.filter(grey,x4,y,stride3,cv2,w,1) + data.b[r] & 255;
						r += rinc;
						grey.set(w++,cv2);
					}
					break;
				default:
					throw "Invalid filter " + f;
				}
			}
			break;
		default:
			throw "Unsupported color mode";
		}
	}
	return grey;
};
snow.utils.format.png.Tools.extract32 = function(d,bytes) {
	var h = snow.utils.format.png.Tools.getHeader(d);
	var bgra;
	if(bytes == null) bgra = haxe.io.Bytes.alloc(h.width * h.height * 4); else bgra = bytes;
	var data = null;
	var fullData = null;
	var $it0 = d.iterator();
	while( $it0.hasNext() ) {
		var c = $it0.next();
		switch(c[1]) {
		case 2:
			var b = c[2];
			if(fullData != null) fullData.add(b); else if(data == null) data = b; else {
				fullData = new haxe.io.BytesBuffer();
				fullData.add(data);
				fullData.add(b);
				data = null;
			}
			break;
		default:
		}
	}
	if(fullData != null) data = fullData.getBytes();
	if(data == null) throw "Data not found";
	data = snow.utils.format.tools.Inflate.run(data);
	var r = 0;
	var w = 0;
	{
		var _g = h.color;
		switch(_g[1]) {
		case 2:
			var pal = snow.utils.format.png.Tools.getPalette(d);
			if(pal == null) throw "PNG Palette is missing";
			var alpha = null;
			try {
				var $it1 = d.iterator();
				while( $it1.hasNext() ) {
					var t = $it1.next();
					switch(t[1]) {
					case 4:
						switch(t[2]) {
						case "tRNS":
							var data1 = t[3];
							alpha = data1;
							throw "__break__";
							break;
						default:
						}
						break;
					default:
					}
				}
			} catch( e ) { if( e != "__break__" ) throw e; }
			var width = h.width;
			var stride = width + 1;
			if(data.length < h.height * stride) throw "Not enough data";
			var vr;
			var vg;
			var vb;
			var va = 255;
			var _g2 = 0;
			var _g1 = h.height;
			while(_g2 < _g1) {
				var y = _g2++;
				var f = data.get(r++);
				switch(f) {
				case 0:
					var _g3 = 0;
					while(_g3 < width) {
						var x = _g3++;
						var c1 = data.get(r++);
						vr = pal.b[c1 * 3];
						vg = pal.b[c1 * 3 + 1];
						vb = pal.b[c1 * 3 + 2];
						if(alpha != null) va = alpha.b[c1];
						bgra.set(w++,vb);
						bgra.set(w++,vg);
						bgra.set(w++,vr);
						bgra.set(w++,va);
					}
					break;
				case 1:
					var cr = 0;
					var cg = 0;
					var cb = 0;
					var ca = 0;
					var _g31 = 0;
					while(_g31 < width) {
						var x1 = _g31++;
						var c2 = data.get(r++);
						vr = pal.b[c2 * 3];
						vg = pal.b[c2 * 3 + 1];
						vb = pal.b[c2 * 3 + 2];
						if(alpha != null) va = alpha.b[c2];
						cb += vb;
						bgra.set(w++,cb);
						cg += vg;
						bgra.set(w++,cg);
						cr += vr;
						bgra.set(w++,cr);
						ca += va;
						bgra.set(w++,ca);
						bgra.set(w++,va);
					}
					break;
				case 2:
					var stride1;
					if(y == 0) stride1 = 0; else stride1 = width * 4;
					var _g32 = 0;
					while(_g32 < width) {
						var x2 = _g32++;
						var c3 = data.get(r++);
						vr = pal.b[c3 * 3];
						vg = pal.b[c3 * 3 + 1];
						vb = pal.b[c3 * 3 + 2];
						if(alpha != null) va = alpha.b[c3];
						bgra.b[w] = vb + bgra.b[w - stride1] & 255;
						w++;
						bgra.b[w] = vg + bgra.b[w - stride1] & 255;
						w++;
						bgra.b[w] = vr + bgra.b[w - stride1] & 255;
						w++;
						bgra.b[w] = va + bgra.b[w - stride1] & 255;
						w++;
					}
					break;
				case 3:
					var cr1 = 0;
					var cg1 = 0;
					var cb1 = 0;
					var ca1 = 0;
					var stride2;
					if(y == 0) stride2 = 0; else stride2 = width * 4;
					var _g33 = 0;
					while(_g33 < width) {
						var x3 = _g33++;
						var c4 = data.get(r++);
						vr = pal.b[c4 * 3];
						vg = pal.b[c4 * 3 + 1];
						vb = pal.b[c4 * 3 + 2];
						if(alpha != null) va = alpha.b[c4];
						cb1 = vb + (cb1 + bgra.b[w - stride2] >> 1) & 255;
						bgra.set(w++,cb1);
						cg1 = vg + (cg1 + bgra.b[w - stride2] >> 1) & 255;
						bgra.set(w++,cg1);
						cr1 = vr + (cr1 + bgra.b[w - stride2] >> 1) & 255;
						bgra.set(w++,cr1);
						cr1 = va + (ca1 + bgra.b[w - stride2] >> 1) & 255;
						bgra.set(w++,ca1);
					}
					break;
				case 4:
					var stride3 = width * 4;
					var cr2 = 0;
					var cg2 = 0;
					var cb2 = 0;
					var ca2 = 0;
					var _g34 = 0;
					while(_g34 < width) {
						var x4 = _g34++;
						var c5 = data.get(r++);
						vr = pal.b[c5 * 3];
						vg = pal.b[c5 * 3 + 1];
						vb = pal.b[c5 * 3 + 2];
						if(alpha != null) va = alpha.b[c5];
						cb2 = snow.utils.format.png.Tools.filter(bgra,x4,y,stride3,cb2,w,null) + vb & 255;
						bgra.set(w++,cb2);
						cg2 = snow.utils.format.png.Tools.filter(bgra,x4,y,stride3,cg2,w,null) + vg & 255;
						bgra.set(w++,cg2);
						cr2 = snow.utils.format.png.Tools.filter(bgra,x4,y,stride3,cr2,w,null) + vr & 255;
						bgra.set(w++,cr2);
						ca2 = snow.utils.format.png.Tools.filter(bgra,x4,y,stride3,ca2,w,null) + va & 255;
						bgra.set(w++,ca2);
					}
					break;
				default:
					throw "Invalid filter " + f;
				}
			}
			break;
		case 0:
			var alpha1 = _g[2];
			if(h.colbits != 8) throw "Unsupported color mode";
			var width1 = h.width;
			var stride4;
			stride4 = (alpha1?2:1) * width1 + 1;
			if(data.length < h.height * stride4) throw "Not enough data";
			var _g21 = 0;
			var _g11 = h.height;
			while(_g21 < _g11) {
				var y1 = _g21++;
				var f1 = data.get(r++);
				switch(f1) {
				case 0:
					if(alpha1) {
						var _g35 = 0;
						while(_g35 < width1) {
							var x5 = _g35++;
							var v = data.get(r++);
							bgra.set(w++,v);
							bgra.set(w++,v);
							bgra.set(w++,v);
							bgra.set(w++,data.get(r++));
						}
					} else {
						var _g36 = 0;
						while(_g36 < width1) {
							var x6 = _g36++;
							var v1 = data.get(r++);
							bgra.set(w++,v1);
							bgra.set(w++,v1);
							bgra.set(w++,v1);
							bgra.set(w++,255);
						}
					}
					break;
				case 1:
					var cv = 0;
					var ca3 = 0;
					if(alpha1) {
						var _g37 = 0;
						while(_g37 < width1) {
							var x7 = _g37++;
							cv += data.get(r++);
							bgra.set(w++,cv);
							bgra.set(w++,cv);
							bgra.set(w++,cv);
							ca3 += data.get(r++);
							bgra.set(w++,ca3);
						}
					} else {
						var _g38 = 0;
						while(_g38 < width1) {
							var x8 = _g38++;
							cv += data.get(r++);
							bgra.set(w++,cv);
							bgra.set(w++,cv);
							bgra.set(w++,cv);
							bgra.set(w++,255);
						}
					}
					break;
				case 2:
					var stride5;
					if(y1 == 0) stride5 = 0; else stride5 = width1 * 4;
					if(alpha1) {
						var _g39 = 0;
						while(_g39 < width1) {
							var x9 = _g39++;
							var v2 = data.get(r++) + bgra.b[w - stride5];
							bgra.set(w++,v2);
							bgra.set(w++,v2);
							bgra.set(w++,v2);
							bgra.set(w++,data.get(r++) + bgra.b[w - stride5]);
						}
					} else {
						var _g310 = 0;
						while(_g310 < width1) {
							var x10 = _g310++;
							var v3 = data.get(r++) + bgra.b[w - stride5];
							bgra.set(w++,v3);
							bgra.set(w++,v3);
							bgra.set(w++,v3);
							bgra.set(w++,255);
						}
					}
					break;
				case 3:
					var cv1 = 0;
					var ca4 = 0;
					var stride6;
					if(y1 == 0) stride6 = 0; else stride6 = width1 * 4;
					if(alpha1) {
						var _g311 = 0;
						while(_g311 < width1) {
							var x11 = _g311++;
							cv1 = data.get(r++) + (cv1 + bgra.b[w - stride6] >> 1) & 255;
							bgra.set(w++,cv1);
							bgra.set(w++,cv1);
							bgra.set(w++,cv1);
							ca4 = data.get(r++) + (ca4 + bgra.b[w - stride6] >> 1) & 255;
							bgra.set(w++,ca4);
						}
					} else {
						var _g312 = 0;
						while(_g312 < width1) {
							var x12 = _g312++;
							cv1 = data.get(r++) + (cv1 + bgra.b[w - stride6] >> 1) & 255;
							bgra.set(w++,cv1);
							bgra.set(w++,cv1);
							bgra.set(w++,cv1);
							bgra.set(w++,255);
						}
					}
					break;
				case 4:
					var stride7 = width1 * 4;
					var cv2 = 0;
					var ca5 = 0;
					if(alpha1) {
						var _g313 = 0;
						while(_g313 < width1) {
							var x13 = _g313++;
							cv2 = snow.utils.format.png.Tools.filter(bgra,x13,y1,stride7,cv2,w,null) + data.get(r++) & 255;
							bgra.set(w++,cv2);
							bgra.set(w++,cv2);
							bgra.set(w++,cv2);
							ca5 = snow.utils.format.png.Tools.filter(bgra,x13,y1,stride7,ca5,w,null) + data.get(r++) & 255;
							bgra.set(w++,ca5);
						}
					} else {
						var _g314 = 0;
						while(_g314 < width1) {
							var x14 = _g314++;
							cv2 = snow.utils.format.png.Tools.filter(bgra,x14,y1,stride7,cv2,w,null) + data.get(r++) & 255;
							bgra.set(w++,cv2);
							bgra.set(w++,cv2);
							bgra.set(w++,cv2);
							bgra.set(w++,255);
						}
					}
					break;
				default:
					throw "Invalid filter " + f1;
				}
			}
			break;
		case 1:
			var alpha2 = _g[2];
			if(h.colbits != 8) throw "Unsupported color mode";
			var width2 = h.width;
			var stride8;
			stride8 = (alpha2?4:3) * width2 + 1;
			if(data.length < h.height * stride8) throw "Not enough data";
			var _g22 = 0;
			var _g12 = h.height;
			while(_g22 < _g12) {
				var y2 = _g22++;
				var f2 = data.get(r++);
				switch(f2) {
				case 0:
					if(alpha2) {
						var _g315 = 0;
						while(_g315 < width2) {
							var x15 = _g315++;
							bgra.set(w++,data.b[r + 2]);
							bgra.set(w++,data.b[r + 1]);
							bgra.set(w++,data.b[r]);
							bgra.set(w++,data.b[r + 3]);
							r += 4;
						}
					} else {
						var _g316 = 0;
						while(_g316 < width2) {
							var x16 = _g316++;
							bgra.set(w++,data.b[r + 2]);
							bgra.set(w++,data.b[r + 1]);
							bgra.set(w++,data.b[r]);
							bgra.set(w++,255);
							r += 3;
						}
					}
					break;
				case 1:
					var cr3 = 0;
					var cg3 = 0;
					var cb3 = 0;
					var ca6 = 0;
					if(alpha2) {
						var _g317 = 0;
						while(_g317 < width2) {
							var x17 = _g317++;
							cb3 += data.b[r + 2];
							bgra.set(w++,cb3);
							cg3 += data.b[r + 1];
							bgra.set(w++,cg3);
							cr3 += data.b[r];
							bgra.set(w++,cr3);
							ca6 += data.b[r + 3];
							bgra.set(w++,ca6);
							r += 4;
						}
					} else {
						var _g318 = 0;
						while(_g318 < width2) {
							var x18 = _g318++;
							cb3 += data.b[r + 2];
							bgra.set(w++,cb3);
							cg3 += data.b[r + 1];
							bgra.set(w++,cg3);
							cr3 += data.b[r];
							bgra.set(w++,cr3);
							bgra.set(w++,255);
							r += 3;
						}
					}
					break;
				case 2:
					var stride9;
					if(y2 == 0) stride9 = 0; else stride9 = width2 * 4;
					if(alpha2) {
						var _g319 = 0;
						while(_g319 < width2) {
							var x19 = _g319++;
							bgra.b[w] = data.b[r + 2] + bgra.b[w - stride9] & 255;
							w++;
							bgra.b[w] = data.b[r + 1] + bgra.b[w - stride9] & 255;
							w++;
							bgra.b[w] = data.b[r] + bgra.b[w - stride9] & 255;
							w++;
							bgra.b[w] = data.b[r + 3] + bgra.b[w - stride9] & 255;
							w++;
							r += 4;
						}
					} else {
						var _g320 = 0;
						while(_g320 < width2) {
							var x20 = _g320++;
							bgra.b[w] = data.b[r + 2] + bgra.b[w - stride9] & 255;
							w++;
							bgra.b[w] = data.b[r + 1] + bgra.b[w - stride9] & 255;
							w++;
							bgra.b[w] = data.b[r] + bgra.b[w - stride9] & 255;
							w++;
							bgra.set(w++,255);
							r += 3;
						}
					}
					break;
				case 3:
					var cr4 = 0;
					var cg4 = 0;
					var cb4 = 0;
					var ca7 = 0;
					var stride10;
					if(y2 == 0) stride10 = 0; else stride10 = width2 * 4;
					if(alpha2) {
						var _g321 = 0;
						while(_g321 < width2) {
							var x21 = _g321++;
							cb4 = data.b[r + 2] + (cb4 + bgra.b[w - stride10] >> 1) & 255;
							bgra.set(w++,cb4);
							cg4 = data.b[r + 1] + (cg4 + bgra.b[w - stride10] >> 1) & 255;
							bgra.set(w++,cg4);
							cr4 = data.b[r] + (cr4 + bgra.b[w - stride10] >> 1) & 255;
							bgra.set(w++,cr4);
							ca7 = data.b[r + 3] + (ca7 + bgra.b[w - stride10] >> 1) & 255;
							bgra.set(w++,ca7);
							r += 4;
						}
					} else {
						var _g322 = 0;
						while(_g322 < width2) {
							var x22 = _g322++;
							cb4 = data.b[r + 2] + (cb4 + bgra.b[w - stride10] >> 1) & 255;
							bgra.set(w++,cb4);
							cg4 = data.b[r + 1] + (cg4 + bgra.b[w - stride10] >> 1) & 255;
							bgra.set(w++,cg4);
							cr4 = data.b[r] + (cr4 + bgra.b[w - stride10] >> 1) & 255;
							bgra.set(w++,cr4);
							bgra.set(w++,255);
							r += 3;
						}
					}
					break;
				case 4:
					var stride11 = width2 * 4;
					var cr5 = 0;
					var cg5 = 0;
					var cb5 = 0;
					var ca8 = 0;
					if(alpha2) {
						var _g323 = 0;
						while(_g323 < width2) {
							var x23 = _g323++;
							cb5 = snow.utils.format.png.Tools.filter(bgra,x23,y2,stride11,cb5,w,null) + data.b[r + 2] & 255;
							bgra.set(w++,cb5);
							cg5 = snow.utils.format.png.Tools.filter(bgra,x23,y2,stride11,cg5,w,null) + data.b[r + 1] & 255;
							bgra.set(w++,cg5);
							cr5 = snow.utils.format.png.Tools.filter(bgra,x23,y2,stride11,cr5,w,null) + data.b[r] & 255;
							bgra.set(w++,cr5);
							ca8 = snow.utils.format.png.Tools.filter(bgra,x23,y2,stride11,ca8,w,null) + data.b[r + 3] & 255;
							bgra.set(w++,ca8);
							r += 4;
						}
					} else {
						var _g324 = 0;
						while(_g324 < width2) {
							var x24 = _g324++;
							cb5 = snow.utils.format.png.Tools.filter(bgra,x24,y2,stride11,cb5,w,null) + data.b[r + 2] & 255;
							bgra.set(w++,cb5);
							cg5 = snow.utils.format.png.Tools.filter(bgra,x24,y2,stride11,cg5,w,null) + data.b[r + 1] & 255;
							bgra.set(w++,cg5);
							cr5 = snow.utils.format.png.Tools.filter(bgra,x24,y2,stride11,cr5,w,null) + data.b[r] & 255;
							bgra.set(w++,cr5);
							bgra.set(w++,255);
							r += 3;
						}
					}
					break;
				default:
					throw "Invalid filter " + f2;
				}
			}
			break;
		}
	}
	return bgra;
};
snow.utils.format.png.Tools.buildGrey = function(width,height,data) {
	var rgb = haxe.io.Bytes.alloc(width * height + height);
	var w = 0;
	var r = 0;
	var _g = 0;
	while(_g < height) {
		var y = _g++;
		rgb.set(w++,0);
		var _g1 = 0;
		while(_g1 < width) {
			var x = _g1++;
			rgb.set(w++,data.get(r++));
		}
	}
	var l = new List();
	l.add(snow.utils.format.png.Chunk.CHeader({ width : width, height : height, colbits : 8, color : snow.utils.format.png.Color.ColGrey(false), interlaced : false}));
	l.add(snow.utils.format.png.Chunk.CData(snow.utils.format.tools.Deflate.run(rgb)));
	l.add(snow.utils.format.png.Chunk.CEnd);
	return l;
};
snow.utils.format.png.Tools.buildRGB = function(width,height,data) {
	var rgb = haxe.io.Bytes.alloc(width * height * 3 + height);
	var w = 0;
	var r = 0;
	var _g = 0;
	while(_g < height) {
		var y = _g++;
		rgb.set(w++,0);
		var _g1 = 0;
		while(_g1 < width) {
			var x = _g1++;
			rgb.set(w++,data.b[r + 2]);
			rgb.set(w++,data.b[r + 1]);
			rgb.set(w++,data.b[r]);
			r += 3;
		}
	}
	var l = new List();
	l.add(snow.utils.format.png.Chunk.CHeader({ width : width, height : height, colbits : 8, color : snow.utils.format.png.Color.ColTrue(false), interlaced : false}));
	l.add(snow.utils.format.png.Chunk.CData(snow.utils.format.tools.Deflate.run(rgb)));
	l.add(snow.utils.format.png.Chunk.CEnd);
	return l;
};
snow.utils.format.png.Tools.build32ARGB = function(width,height,data) {
	var rgba = haxe.io.Bytes.alloc(width * height * 4 + height);
	var w = 0;
	var r = 0;
	var _g = 0;
	while(_g < height) {
		var y = _g++;
		rgba.set(w++,0);
		var _g1 = 0;
		while(_g1 < width) {
			var x = _g1++;
			rgba.set(w++,data.b[r + 1]);
			rgba.set(w++,data.b[r + 2]);
			rgba.set(w++,data.b[r + 3]);
			rgba.set(w++,data.b[r]);
			r += 4;
		}
	}
	var l = new List();
	l.add(snow.utils.format.png.Chunk.CHeader({ width : width, height : height, colbits : 8, color : snow.utils.format.png.Color.ColTrue(true), interlaced : false}));
	l.add(snow.utils.format.png.Chunk.CData(snow.utils.format.tools.Deflate.run(rgba)));
	l.add(snow.utils.format.png.Chunk.CEnd);
	return l;
};
snow.utils.format.png.Tools.build32BGRA = function(width,height,data) {
	var rgba = haxe.io.Bytes.alloc(width * height * 4 + height);
	var w = 0;
	var r = 0;
	var _g = 0;
	while(_g < height) {
		var y = _g++;
		rgba.set(w++,0);
		var _g1 = 0;
		while(_g1 < width) {
			var x = _g1++;
			rgba.set(w++,data.b[r + 2]);
			rgba.set(w++,data.b[r + 1]);
			rgba.set(w++,data.b[r]);
			rgba.set(w++,data.b[r + 3]);
			r += 4;
		}
	}
	var l = new List();
	l.add(snow.utils.format.png.Chunk.CHeader({ width : width, height : height, colbits : 8, color : snow.utils.format.png.Color.ColTrue(true), interlaced : false}));
	l.add(snow.utils.format.png.Chunk.CData(snow.utils.format.tools.Deflate.run(rgba)));
	l.add(snow.utils.format.png.Chunk.CEnd);
	return l;
};
snow.utils.format.tools = {};
snow.utils.format.tools.Adler32 = function() {
	this.a1 = 1;
	this.a2 = 0;
};
$hxClasses["snow.utils.format.tools.Adler32"] = snow.utils.format.tools.Adler32;
snow.utils.format.tools.Adler32.__name__ = true;
snow.utils.format.tools.Adler32.read = function(i) {
	var a = new snow.utils.format.tools.Adler32();
	var a2a = i.readByte();
	var a2b = i.readByte();
	var a1a = i.readByte();
	var a1b = i.readByte();
	a.a1 = a1a << 8 | a1b;
	a.a2 = a2a << 8 | a2b;
	return a;
};
snow.utils.format.tools.Adler32.prototype = {
	update: function(b,pos,len) {
		var a1 = this.a1;
		var a2 = this.a2;
		var _g1 = pos;
		var _g = pos + len;
		while(_g1 < _g) {
			var p = _g1++;
			var c = b.b[p];
			a1 = (a1 + c) % 65521;
			a2 = (a2 + a1) % 65521;
		}
		this.a1 = a1;
		this.a2 = a2;
	}
	,equals: function(a) {
		return a.a1 == this.a1 && a.a2 == this.a2;
	}
	,__class__: snow.utils.format.tools.Adler32
};
snow.utils.format.tools.Deflate = function() { };
$hxClasses["snow.utils.format.tools.Deflate"] = snow.utils.format.tools.Deflate;
snow.utils.format.tools.Deflate.__name__ = true;
snow.utils.format.tools.Deflate.run = function(b) {
	throw "Deflate is not supported on this platform";
	return null;
};
snow.utils.format.tools.Huffman = { __ename__ : true, __constructs__ : ["Found","NeedBit","NeedBits"] };
snow.utils.format.tools.Huffman.Found = function(i) { var $x = ["Found",0,i]; $x.__enum__ = snow.utils.format.tools.Huffman; $x.toString = $estr; return $x; };
snow.utils.format.tools.Huffman.NeedBit = function(left,right) { var $x = ["NeedBit",1,left,right]; $x.__enum__ = snow.utils.format.tools.Huffman; $x.toString = $estr; return $x; };
snow.utils.format.tools.Huffman.NeedBits = function(n,table) { var $x = ["NeedBits",2,n,table]; $x.__enum__ = snow.utils.format.tools.Huffman; $x.toString = $estr; return $x; };
snow.utils.format.tools.Huffman.__empty_constructs__ = [];
snow.utils.format.tools.HuffTools = function() {
};
$hxClasses["snow.utils.format.tools.HuffTools"] = snow.utils.format.tools.HuffTools;
snow.utils.format.tools.HuffTools.__name__ = true;
snow.utils.format.tools.HuffTools.prototype = {
	treeDepth: function(t) {
		switch(t[1]) {
		case 0:
			return 0;
		case 2:
			throw "assert";
			break;
		case 1:
			var b = t[3];
			var a = t[2];
			var da = this.treeDepth(a);
			var db = this.treeDepth(b);
			return 1 + (da < db?da:db);
		}
	}
	,treeCompress: function(t) {
		var d = this.treeDepth(t);
		if(d == 0) return t;
		if(d == 1) switch(t[1]) {
		case 1:
			var b = t[3];
			var a = t[2];
			return snow.utils.format.tools.Huffman.NeedBit(this.treeCompress(a),this.treeCompress(b));
		default:
			throw "assert";
		}
		var size = 1 << d;
		var table = new Array();
		var _g = 0;
		while(_g < size) {
			var i = _g++;
			table.push(snow.utils.format.tools.Huffman.Found(-1));
		}
		this.treeWalk(table,0,0,d,t);
		return snow.utils.format.tools.Huffman.NeedBits(d,table);
	}
	,treeWalk: function(table,p,cd,d,t) {
		switch(t[1]) {
		case 1:
			var b = t[3];
			var a = t[2];
			if(d > 0) {
				this.treeWalk(table,p,cd + 1,d - 1,a);
				this.treeWalk(table,p | 1 << cd,cd + 1,d - 1,b);
			} else table[p] = this.treeCompress(t);
			break;
		default:
			table[p] = this.treeCompress(t);
		}
	}
	,treeMake: function(bits,maxbits,v,len) {
		if(len > maxbits) throw "Invalid huffman";
		var idx = v << 5 | len;
		if(bits.exists(idx)) return snow.utils.format.tools.Huffman.Found(bits.get(idx));
		v <<= 1;
		len += 1;
		return snow.utils.format.tools.Huffman.NeedBit(this.treeMake(bits,maxbits,v,len),this.treeMake(bits,maxbits,v | 1,len));
	}
	,make: function(lengths,pos,nlengths,maxbits) {
		var counts = new Array();
		var tmp = new Array();
		if(maxbits > 32) throw "Invalid huffman";
		var _g = 0;
		while(_g < maxbits) {
			var i = _g++;
			counts.push(0);
			tmp.push(0);
		}
		var _g1 = 0;
		while(_g1 < nlengths) {
			var i1 = _g1++;
			var p = lengths[i1 + pos];
			if(p >= maxbits) throw "Invalid huffman";
			counts[p]++;
		}
		var code = 0;
		var _g11 = 1;
		var _g2 = maxbits - 1;
		while(_g11 < _g2) {
			var i2 = _g11++;
			code = code + counts[i2] << 1;
			tmp[i2] = code;
		}
		var bits = new haxe.ds.IntMap();
		var _g3 = 0;
		while(_g3 < nlengths) {
			var i3 = _g3++;
			var l = lengths[i3 + pos];
			if(l != 0) {
				var n = tmp[l - 1];
				tmp[l - 1] = n + 1;
				bits.set(n << 5 | l,i3);
			}
		}
		return this.treeCompress(snow.utils.format.tools.Huffman.NeedBit(this.treeMake(bits,maxbits,0,1),this.treeMake(bits,maxbits,1,1)));
	}
	,__class__: snow.utils.format.tools.HuffTools
};
snow.utils.format.tools.Inflate = function() { };
$hxClasses["snow.utils.format.tools.Inflate"] = snow.utils.format.tools.Inflate;
snow.utils.format.tools.Inflate.__name__ = true;
snow.utils.format.tools.Inflate.run = function(bytes) {
	return snow.utils.format.tools.InflateImpl.run(new haxe.io.BytesInput(bytes));
};
snow.utils.format.tools._InflateImpl = {};
snow.utils.format.tools._InflateImpl.Window = function(hasCrc) {
	this.buffer = haxe.io.Bytes.alloc(65536);
	this.pos = 0;
	if(hasCrc) this.crc = new snow.utils.format.tools.Adler32();
};
$hxClasses["snow.utils.format.tools._InflateImpl.Window"] = snow.utils.format.tools._InflateImpl.Window;
snow.utils.format.tools._InflateImpl.Window.__name__ = true;
snow.utils.format.tools._InflateImpl.Window.prototype = {
	slide: function() {
		if(this.crc != null) this.crc.update(this.buffer,0,32768);
		var b = haxe.io.Bytes.alloc(65536);
		this.pos -= 32768;
		b.blit(0,this.buffer,32768,this.pos);
		this.buffer = b;
	}
	,addBytes: function(b,p,len) {
		if(this.pos + len > 65536) this.slide();
		this.buffer.blit(this.pos,b,p,len);
		this.pos += len;
	}
	,addByte: function(c) {
		if(this.pos == 65536) this.slide();
		this.buffer.b[this.pos] = c & 255;
		this.pos++;
	}
	,getLastChar: function() {
		return this.buffer.b[this.pos - 1];
	}
	,available: function() {
		return this.pos;
	}
	,checksum: function() {
		if(this.crc != null) this.crc.update(this.buffer,0,this.pos);
		return this.crc;
	}
	,__class__: snow.utils.format.tools._InflateImpl.Window
};
snow.utils.format.tools._InflateImpl.State = { __ename__ : true, __constructs__ : ["Head","Block","CData","Flat","Crc","Dist","DistOne","Done"] };
snow.utils.format.tools._InflateImpl.State.Head = ["Head",0];
snow.utils.format.tools._InflateImpl.State.Head.toString = $estr;
snow.utils.format.tools._InflateImpl.State.Head.__enum__ = snow.utils.format.tools._InflateImpl.State;
snow.utils.format.tools._InflateImpl.State.Block = ["Block",1];
snow.utils.format.tools._InflateImpl.State.Block.toString = $estr;
snow.utils.format.tools._InflateImpl.State.Block.__enum__ = snow.utils.format.tools._InflateImpl.State;
snow.utils.format.tools._InflateImpl.State.CData = ["CData",2];
snow.utils.format.tools._InflateImpl.State.CData.toString = $estr;
snow.utils.format.tools._InflateImpl.State.CData.__enum__ = snow.utils.format.tools._InflateImpl.State;
snow.utils.format.tools._InflateImpl.State.Flat = ["Flat",3];
snow.utils.format.tools._InflateImpl.State.Flat.toString = $estr;
snow.utils.format.tools._InflateImpl.State.Flat.__enum__ = snow.utils.format.tools._InflateImpl.State;
snow.utils.format.tools._InflateImpl.State.Crc = ["Crc",4];
snow.utils.format.tools._InflateImpl.State.Crc.toString = $estr;
snow.utils.format.tools._InflateImpl.State.Crc.__enum__ = snow.utils.format.tools._InflateImpl.State;
snow.utils.format.tools._InflateImpl.State.Dist = ["Dist",5];
snow.utils.format.tools._InflateImpl.State.Dist.toString = $estr;
snow.utils.format.tools._InflateImpl.State.Dist.__enum__ = snow.utils.format.tools._InflateImpl.State;
snow.utils.format.tools._InflateImpl.State.DistOne = ["DistOne",6];
snow.utils.format.tools._InflateImpl.State.DistOne.toString = $estr;
snow.utils.format.tools._InflateImpl.State.DistOne.__enum__ = snow.utils.format.tools._InflateImpl.State;
snow.utils.format.tools._InflateImpl.State.Done = ["Done",7];
snow.utils.format.tools._InflateImpl.State.Done.toString = $estr;
snow.utils.format.tools._InflateImpl.State.Done.__enum__ = snow.utils.format.tools._InflateImpl.State;
snow.utils.format.tools._InflateImpl.State.__empty_constructs__ = [snow.utils.format.tools._InflateImpl.State.Head,snow.utils.format.tools._InflateImpl.State.Block,snow.utils.format.tools._InflateImpl.State.CData,snow.utils.format.tools._InflateImpl.State.Flat,snow.utils.format.tools._InflateImpl.State.Crc,snow.utils.format.tools._InflateImpl.State.Dist,snow.utils.format.tools._InflateImpl.State.DistOne,snow.utils.format.tools._InflateImpl.State.Done];
snow.utils.format.tools.InflateImpl = function(i,header,crc) {
	if(crc == null) crc = true;
	if(header == null) header = true;
	this["final"] = false;
	this.htools = new snow.utils.format.tools.HuffTools();
	this.huffman = this.buildFixedHuffman();
	this.huffdist = null;
	this.len = 0;
	this.dist = 0;
	if(header) this.state = snow.utils.format.tools._InflateImpl.State.Head; else this.state = snow.utils.format.tools._InflateImpl.State.Block;
	this.input = i;
	this.bits = 0;
	this.nbits = 0;
	this.needed = 0;
	this.output = null;
	this.outpos = 0;
	this.lengths = new Array();
	var _g = 0;
	while(_g < 19) {
		var i1 = _g++;
		this.lengths.push(-1);
	}
	this.window = new snow.utils.format.tools._InflateImpl.Window(crc);
};
$hxClasses["snow.utils.format.tools.InflateImpl"] = snow.utils.format.tools.InflateImpl;
snow.utils.format.tools.InflateImpl.__name__ = true;
snow.utils.format.tools.InflateImpl.run = function(i,bufsize) {
	if(bufsize == null) bufsize = 65536;
	var buf = haxe.io.Bytes.alloc(bufsize);
	var output = new haxe.io.BytesBuffer();
	var inflate = new snow.utils.format.tools.InflateImpl(i);
	while(true) {
		var len = inflate.readBytes(buf,0,bufsize);
		output.addBytes(buf,0,len);
		if(len < bufsize) break;
	}
	return output.getBytes();
};
snow.utils.format.tools.InflateImpl.prototype = {
	buildFixedHuffman: function() {
		if(snow.utils.format.tools.InflateImpl.FIXED_HUFFMAN != null) return snow.utils.format.tools.InflateImpl.FIXED_HUFFMAN;
		var a = new Array();
		var _g = 0;
		while(_g < 288) {
			var n = _g++;
			a.push(n <= 143?8:n <= 255?9:n <= 279?7:8);
		}
		snow.utils.format.tools.InflateImpl.FIXED_HUFFMAN = this.htools.make(a,0,288,10);
		return snow.utils.format.tools.InflateImpl.FIXED_HUFFMAN;
	}
	,readBytes: function(b,pos,len) {
		this.needed = len;
		this.outpos = pos;
		this.output = b;
		if(len > 0) while(this.inflateLoop()) {
		}
		return len - this.needed;
	}
	,getBits: function(n) {
		while(this.nbits < n) {
			this.bits |= this.input.readByte() << this.nbits;
			this.nbits += 8;
		}
		var b = this.bits & (1 << n) - 1;
		this.nbits -= n;
		this.bits >>= n;
		return b;
	}
	,getBit: function() {
		if(this.nbits == 0) {
			this.nbits = 8;
			this.bits = this.input.readByte();
		}
		var b = (this.bits & 1) == 1;
		this.nbits--;
		this.bits >>= 1;
		return b;
	}
	,getRevBits: function(n) {
		if(n == 0) return 0; else if(this.getBit()) return 1 << n - 1 | this.getRevBits(n - 1); else return this.getRevBits(n - 1);
	}
	,resetBits: function() {
		this.bits = 0;
		this.nbits = 0;
	}
	,addBytes: function(b,p,len) {
		this.window.addBytes(b,p,len);
		this.output.blit(this.outpos,b,p,len);
		this.needed -= len;
		this.outpos += len;
	}
	,addByte: function(b) {
		this.window.addByte(b);
		this.output.b[this.outpos] = b & 255;
		this.needed--;
		this.outpos++;
	}
	,addDistOne: function(n) {
		var c = this.window.getLastChar();
		var _g = 0;
		while(_g < n) {
			var i = _g++;
			this.addByte(c);
		}
	}
	,addDist: function(d,len) {
		this.addBytes(this.window.buffer,this.window.pos - d,len);
	}
	,applyHuffman: function(h) {
		switch(h[1]) {
		case 0:
			var n = h[2];
			return n;
		case 1:
			var b = h[3];
			var a = h[2];
			return this.applyHuffman(this.getBit()?b:a);
		case 2:
			var tbl = h[3];
			var n1 = h[2];
			return this.applyHuffman(tbl[this.getBits(n1)]);
		}
	}
	,inflateLengths: function(a,max) {
		var i = 0;
		var prev = 0;
		while(i < max) {
			var n = this.applyHuffman(this.huffman);
			switch(n) {
			case 0:case 1:case 2:case 3:case 4:case 5:case 6:case 7:case 8:case 9:case 10:case 11:case 12:case 13:case 14:case 15:
				prev = n;
				a[i] = n;
				i++;
				break;
			case 16:
				var end = i + 3 + this.getBits(2);
				if(end > max) throw "Invalid data";
				while(i < end) {
					a[i] = prev;
					i++;
				}
				break;
			case 17:
				i += 3 + this.getBits(3);
				if(i > max) throw "Invalid data";
				break;
			case 18:
				i += 11 + this.getBits(7);
				if(i > max) throw "Invalid data";
				break;
			default:
				throw "Invalid data";
			}
		}
	}
	,inflateLoop: function() {
		var _g = this.state;
		switch(_g[1]) {
		case 0:
			var cmf = this.input.readByte();
			var cm = cmf & 15;
			var cinfo = cmf >> 4;
			if(cm != 8 || cinfo != 7) throw "Invalid data";
			var flg = this.input.readByte();
			var fdict = (flg & 32) != 0;
			if(((cmf << 8) + flg) % 31 != 0) throw "Invalid data";
			if(fdict) throw "Unsupported dictionary";
			this.state = snow.utils.format.tools._InflateImpl.State.Block;
			return true;
		case 4:
			var calc = this.window.checksum();
			if(calc == null) {
				this.state = snow.utils.format.tools._InflateImpl.State.Done;
				return true;
			}
			var crc = snow.utils.format.tools.Adler32.read(this.input);
			if(!calc.equals(crc)) throw "Invalid CRC";
			this.state = snow.utils.format.tools._InflateImpl.State.Done;
			return true;
		case 7:
			return false;
		case 1:
			this["final"] = this.getBit();
			var _g1 = this.getBits(2);
			switch(_g1) {
			case 0:
				this.len = this.input.readUInt16();
				var nlen = this.input.readUInt16();
				if(nlen != 65535 - this.len) throw "Invalid data";
				this.state = snow.utils.format.tools._InflateImpl.State.Flat;
				var r = this.inflateLoop();
				this.resetBits();
				return r;
			case 1:
				this.huffman = this.buildFixedHuffman();
				this.huffdist = null;
				this.state = snow.utils.format.tools._InflateImpl.State.CData;
				return true;
			case 2:
				var hlit = this.getBits(5) + 257;
				var hdist = this.getBits(5) + 1;
				var hclen = this.getBits(4) + 4;
				var _g2 = 0;
				while(_g2 < hclen) {
					var i = _g2++;
					this.lengths[snow.utils.format.tools.InflateImpl.CODE_LENGTHS_POS[i]] = this.getBits(3);
				}
				var _g21 = hclen;
				while(_g21 < 19) {
					var i1 = _g21++;
					this.lengths[snow.utils.format.tools.InflateImpl.CODE_LENGTHS_POS[i1]] = 0;
				}
				this.huffman = this.htools.make(this.lengths,0,19,8);
				var lengths = new Array();
				var _g3 = 0;
				var _g22 = hlit + hdist;
				while(_g3 < _g22) {
					var i2 = _g3++;
					lengths.push(0);
				}
				this.inflateLengths(lengths,hlit + hdist);
				this.huffdist = this.htools.make(lengths,hlit,hdist,16);
				this.huffman = this.htools.make(lengths,0,hlit,16);
				this.state = snow.utils.format.tools._InflateImpl.State.CData;
				return true;
			default:
				throw "Invalid data";
			}
			break;
		case 3:
			var rlen;
			if(this.len < this.needed) rlen = this.len; else rlen = this.needed;
			var bytes = this.input.read(rlen);
			this.len -= rlen;
			this.addBytes(bytes,0,rlen);
			if(this.len == 0) if(this["final"]) this.state = snow.utils.format.tools._InflateImpl.State.Crc; else this.state = snow.utils.format.tools._InflateImpl.State.Block;
			return this.needed > 0;
		case 6:
			var rlen1;
			if(this.len < this.needed) rlen1 = this.len; else rlen1 = this.needed;
			this.addDistOne(rlen1);
			this.len -= rlen1;
			if(this.len == 0) this.state = snow.utils.format.tools._InflateImpl.State.CData;
			return this.needed > 0;
		case 5:
			while(this.len > 0 && this.needed > 0) {
				var rdist;
				if(this.len < this.dist) rdist = this.len; else rdist = this.dist;
				var rlen2;
				if(this.needed < rdist) rlen2 = this.needed; else rlen2 = rdist;
				this.addDist(this.dist,rlen2);
				this.len -= rlen2;
			}
			if(this.len == 0) this.state = snow.utils.format.tools._InflateImpl.State.CData;
			return this.needed > 0;
		case 2:
			var n = this.applyHuffman(this.huffman);
			if(n < 256) {
				this.addByte(n);
				return this.needed > 0;
			} else if(n == 256) {
				if(this["final"]) this.state = snow.utils.format.tools._InflateImpl.State.Crc; else this.state = snow.utils.format.tools._InflateImpl.State.Block;
				return true;
			} else {
				n -= 257;
				var extra_bits = snow.utils.format.tools.InflateImpl.LEN_EXTRA_BITS_TBL[n];
				if(extra_bits == -1) throw "Invalid data";
				this.len = snow.utils.format.tools.InflateImpl.LEN_BASE_VAL_TBL[n] + this.getBits(extra_bits);
				var dist_code;
				if(this.huffdist == null) dist_code = this.getRevBits(5); else dist_code = this.applyHuffman(this.huffdist);
				extra_bits = snow.utils.format.tools.InflateImpl.DIST_EXTRA_BITS_TBL[dist_code];
				if(extra_bits == -1) throw "Invalid data";
				this.dist = snow.utils.format.tools.InflateImpl.DIST_BASE_VAL_TBL[dist_code] + this.getBits(extra_bits);
				if(this.dist > this.window.available()) throw "Invalid data";
				if(this.dist == 1) this.state = snow.utils.format.tools._InflateImpl.State.DistOne; else this.state = snow.utils.format.tools._InflateImpl.State.Dist;
				return true;
			}
			break;
		}
	}
	,__class__: snow.utils.format.tools.InflateImpl
};
snow.window.Window = function(_manager,_config) {
	this.internal_resize = false;
	this.internal_position = false;
	this.minimized = false;
	this.closed = true;
	this.auto_render = true;
	this.auto_swap = true;
	this.height = 0;
	this.width = 0;
	this.y = 0;
	this.x = 0;
	this.fullscreen = false;
	this.grab = false;
	this.bordered = true;
	this.title = "snow window";
	this.set_max_size({ x : 0, y : 0});
	this.set_min_size({ x : 0, y : 0});
	this.manager = _manager;
	this.asked_config = _config;
	this.config = _config;
	if(this.config.x == null) this.config.x = 536805376;
	if(this.config.y == null) this.config.y = 536805376;
	this.manager.platform.create(_manager.lib.config.render,_config,$bind(this,this.on_window_created));
};
$hxClasses["snow.window.Window"] = snow.window.Window;
snow.window.Window.__name__ = true;
snow.window.Window.prototype = {
	on_window_created: function(_handle,_id,_configs) {
		haxe.Log.trace(_configs,{ fileName : "Window.hx", lineNumber : 90, className : "snow.window.Window", methodName : "on_window_created"});
		this.id = _id;
		this.handle = _handle;
		if(this.handle == null) {
			haxe.Log.trace("   i / window / " + "failed to create window",{ fileName : "Window.hx", lineNumber : 96, className : "snow.window.Window", methodName : "on_window_created"});
			return;
		}
		this.closed = false;
		this.config = _configs.config;
		this.manager.lib.config.render = _configs.render_config;
		this.internal_position = true;
		this.set_x(this.config.x);
		this.set_y(this.config.y);
		this.internal_position = false;
		this.internal_resize = true;
		this.set_width(this.config.width);
		this.set_height(this.config.height);
		this.internal_resize = false;
		this.on_event({ type : 1, window_id : _id, timestamp : snow.Snow.core.timestamp(), event : { }});
		null;
	}
	,on_event: function(_event) {
		var _g = _event.type;
		switch(_g) {
		case 5:
			this.internal_position = true;
			this.set_position(_event.event.x,_event.event.y);
			this.internal_position = false;
			break;
		case 6:
			this.internal_resize = true;
			this.set_size(_event.event.x,_event.event.y);
			this.internal_resize = false;
			break;
		case 7:
			this.internal_resize = true;
			this.set_size(_event.event.x,_event.event.y);
			this.internal_resize = false;
			break;
		case 8:
			this.minimized = true;
			break;
		case 10:
			this.minimized = false;
			break;
		default:
		}
		if(this.onevent != null) this.onevent(_event);
	}
	,update: function() {
		if(this.handle != null && !this.closed) this.manager.platform.update(this);
	}
	,render: function() {
		if(this.minimized || this.closed) return;
		if(this.handle == null) return;
		this.manager.platform.render(this);
		if(this.onrender != null) {
			this.onrender(this);
			if(this.auto_swap) this.swap();
			return;
		}
		snow.platform.web.render.opengl.GL.clearColor(0.8,0.12,0.12,1.0);
		snow.platform.web.render.opengl.GL.clear(16384);
		if(this.auto_swap) this.swap();
	}
	,swap: function() {
		if(this.handle == null || this.closed || this.minimized) return;
		this.manager.platform.swap(this);
	}
	,destroy: function() {
		this.closed = true;
		if(this.handle == null) return;
		this.manager.remove(this);
		this.manager.platform.destroy_window(this);
		this.handle = null;
	}
	,close: function() {
		this.closed = true;
		if(this.handle == null) return;
		this.manager.platform.close(this);
	}
	,show: function() {
		if(this.handle == null) return;
		this.closed = false;
		this.manager.platform.show(this);
	}
	,simple_message: function(message,title) {
		if(title == null) title = "";
		if(this.handle == null) return;
		this.manager.platform.simple_message(this,message,title);
	}
	,get_fullscreen: function() {
		return this.fullscreen;
	}
	,set_fullscreen: function(_enable) {
		if(this.handle != null) this.manager.platform.fullscreen(this,_enable);
		return this.fullscreen = _enable;
	}
	,get_bordered: function() {
		return this.bordered;
	}
	,get_grab: function() {
		return this.grab;
	}
	,get_max_size: function() {
		return this.max_size;
	}
	,get_min_size: function() {
		return this.min_size;
	}
	,get_title: function() {
		return this.title;
	}
	,set_title: function(_title) {
		if(this.handle != null) this.manager.platform.set_title(this,_title);
		return this.title = _title;
	}
	,set_x: function(_x) {
		this.x = _x;
		if(this.handle != null && !this.internal_position) this.manager.platform.set_position(this,this.x,this.y);
		return this.x;
	}
	,set_y: function(_y) {
		this.y = _y;
		if(this.handle != null && !this.internal_position) this.manager.platform.set_position(this,this.x,this.y);
		return this.y;
	}
	,set_width: function(_width) {
		this.width = _width;
		if(this.handle != null && !this.internal_resize) this.manager.platform.set_size(this,this.width,this.height);
		return this.width;
	}
	,set_height: function(_height) {
		this.height = _height;
		if(this.handle != null && !this.internal_resize) this.manager.platform.set_size(this,this.width,this.height);
		return this.height;
	}
	,set_cursor_position: function(_x,_y) {
		if(this.handle != null && !this.closed) this.manager.platform.set_cursor_position(this,_x,_y);
	}
	,set_position: function(_x,_y) {
		var last_internal_position_flag = this.internal_position;
		this.internal_position = true;
		this.set_x(_x);
		this.set_y(_y);
		this.internal_position = last_internal_position_flag;
		if(this.handle != null && !this.internal_position) this.manager.platform.set_position(this,this.x,this.y);
	}
	,set_size: function(_width,_height) {
		var last_internal_resize_flag = this.internal_resize;
		this.internal_resize = true;
		this.set_width(_width);
		this.set_height(_height);
		this.internal_resize = last_internal_resize_flag;
		if(this.handle != null && !this.internal_resize) this.manager.platform.set_size(this,_width,_height);
	}
	,set_max_size: function(_size) {
		if(this.get_max_size() != null && this.handle != null) this.manager.platform.set_max_size(this,_size.x,_size.y);
		return this.max_size = _size;
	}
	,set_min_size: function(_size) {
		if(this.get_min_size() != null && this.handle != null) this.manager.platform.set_min_size(this,_size.x,_size.y);
		return this.min_size = _size;
	}
	,set_bordered: function(_bordered) {
		if(this.handle != null) this.manager.platform.bordered(this,_bordered);
		return this.bordered = _bordered;
	}
	,set_grab: function(_grab) {
		if(this.handle != null) this.manager.platform.grab(this,_grab);
		return this.grab = _grab;
	}
	,__class__: snow.window.Window
};
snow.window.Windowing = function(_lib) {
	this.window_count = 0;
	this.lib = _lib;
	this.window_list = new haxe.ds.IntMap();
	this.window_handles = new haxe.ds.ObjectMap();
	this.platform = new snow.platform.web.window.WindowSystem(this,this.lib);
	this.platform.init();
};
$hxClasses["snow.window.Windowing"] = snow.window.Windowing;
snow.window.Windowing.__name__ = true;
snow.window.Windowing.prototype = {
	create: function(_config) {
		var _window = new snow.window.Window(this,_config);
		this.window_list.set(_window.id,_window);
		this.window_handles.set(_window.handle,_window.id);
		this.window_count++;
		this.platform.listen(_window);
		if(_config.no_input == null || _config.no_input == false) this.lib.input.listen(_window);
		return _window;
	}
	,remove: function(_window) {
		this.window_list.remove(_window.id);
		this.window_handles.remove(_window.handle);
		this.window_count--;
		this.platform.unlisten(_window);
		if(_window.config.no_input == null || _window.config.no_input == false) this.lib.input.unlisten(_window);
	}
	,window_from_handle: function(_handle) {
		if(this.window_handles.h.__keys__[_handle.__id__] != null) {
			var _id = this.window_handles.h[_handle.__id__];
			return this.window_list.get(_id);
		}
		return null;
	}
	,window_from_id: function(_id) {
		return this.window_list.get(_id);
	}
	,enable_vsync: function(_enable) {
		return this.platform.system_enable_vsync(_enable);
	}
	,enable_cursor: function(_enable) {
		this.platform.system_enable_cursor(_enable);
	}
	,enable_cursor_lock: function(_enable) {
		this.platform.system_lock_cursor(_enable);
	}
	,display_count: function() {
		return this.platform.display_count();
	}
	,display_mode_count: function(display) {
		return this.platform.display_mode_count(display);
	}
	,display_native_mode: function(display) {
		return this.platform.display_native_mode(display);
	}
	,display_current_mode: function(display) {
		return this.platform.display_current_mode(display);
	}
	,display_mode: function(display,mode_index) {
		return this.platform.display_mode(display,mode_index);
	}
	,display_bounds: function(display) {
		return this.platform.display_bounds(display);
	}
	,display_name: function(display) {
		return this.platform.display_name(display);
	}
	,on_event: function(_event) {
		if(_event.type == 5) {
			var _window_event = _event.window;
			var _window = this.window_list.get(_window_event.window_id);
			if(_window != null) _window.on_event(_window_event);
		}
	}
	,update: function() {
		this.platform.process();
		var $it0 = this.window_list.iterator();
		while( $it0.hasNext() ) {
			var $window = $it0.next();
			$window.update();
		}
		var $it1 = this.window_list.iterator();
		while( $it1.hasNext() ) {
			var window1 = $it1.next();
			if(window1.auto_render) window1.render();
		}
	}
	,destroy: function() {
		this.platform.destroy();
	}
	,__class__: snow.window.Windowing
};
function $iterator(o) { if( o instanceof Array ) return function() { return HxOverrides.iter(o); }; return typeof(o.iterator) == 'function' ? $bind(o,o.iterator) : o.iterator; }
var $_, $fid = 0;
function $bind(o,m) { if( m == null ) return null; if( m.__id__ == null ) m.__id__ = $fid++; var f; if( o.hx__closures__ == null ) o.hx__closures__ = {}; else f = o.hx__closures__[m.__id__]; if( f == null ) { f = function(){ return f.method.apply(f.scope, arguments); }; f.scope = o; f.method = m; o.hx__closures__[m.__id__] = f; } return f; }
if(Array.prototype.indexOf) HxOverrides.indexOf = function(a,o,i) {
	return Array.prototype.indexOf.call(a,o,i);
};
Math.NaN = Number.NaN;
Math.NEGATIVE_INFINITY = Number.NEGATIVE_INFINITY;
Math.POSITIVE_INFINITY = Number.POSITIVE_INFINITY;
$hxClasses.Math = Math;
Math.isFinite = function(i) {
	return isFinite(i);
};
Math.isNaN = function(i1) {
	return isNaN(i1);
};
String.prototype.__class__ = $hxClasses.String = String;
String.__name__ = true;
$hxClasses.Array = Array;
Array.__name__ = true;
Date.prototype.__class__ = $hxClasses.Date = Date;
Date.__name__ = ["Date"];
var Int = $hxClasses.Int = { __name__ : ["Int"]};
var Dynamic = $hxClasses.Dynamic = { __name__ : ["Dynamic"]};
var Float = $hxClasses.Float = Number;
Float.__name__ = ["Float"];
var Bool = Boolean;
Bool.__ename__ = ["Bool"];
var Class = $hxClasses.Class = { __name__ : ["Class"]};
var Enum = { };
if(Array.prototype.filter == null) Array.prototype.filter = function(f1) {
	var a1 = [];
	var _g11 = 0;
	var _g2 = this.length;
	while(_g11 < _g2) {
		var i1 = _g11++;
		var e = this[i1];
		if(f1(e)) a1.push(e);
	}
	return a1;
};
Main.OFFSCREEN_RENDER = true;
gltoolbox.GeometryTools.textureQuadCache = new haxe.ds.IntMap();
gltoolbox.GeometryTools.clipSpaceQuadCache = new haxe.ds.IntMap();
gltoolbox.shaders.Resample.instance = new gltoolbox.shaders.Resample();
haxe.ds.ObjectMap.count = 0;
shaderblox.uniforms.UTexture.lastActiveTexture = -1;
snow.Log._level = 1;
snow.Log._log_width = 16;
snow.input.Scancodes.MASK = 1073741824;
snow.input.Scancodes.unknown = 0;
snow.input.Scancodes.key_a = 4;
snow.input.Scancodes.key_b = 5;
snow.input.Scancodes.key_c = 6;
snow.input.Scancodes.key_d = 7;
snow.input.Scancodes.key_e = 8;
snow.input.Scancodes.key_f = 9;
snow.input.Scancodes.key_g = 10;
snow.input.Scancodes.key_h = 11;
snow.input.Scancodes.key_i = 12;
snow.input.Scancodes.key_j = 13;
snow.input.Scancodes.key_k = 14;
snow.input.Scancodes.key_l = 15;
snow.input.Scancodes.key_m = 16;
snow.input.Scancodes.key_n = 17;
snow.input.Scancodes.key_o = 18;
snow.input.Scancodes.key_p = 19;
snow.input.Scancodes.key_q = 20;
snow.input.Scancodes.key_r = 21;
snow.input.Scancodes.key_s = 22;
snow.input.Scancodes.key_t = 23;
snow.input.Scancodes.key_u = 24;
snow.input.Scancodes.key_v = 25;
snow.input.Scancodes.key_w = 26;
snow.input.Scancodes.key_x = 27;
snow.input.Scancodes.key_y = 28;
snow.input.Scancodes.key_z = 29;
snow.input.Scancodes.key_1 = 30;
snow.input.Scancodes.key_2 = 31;
snow.input.Scancodes.key_3 = 32;
snow.input.Scancodes.key_4 = 33;
snow.input.Scancodes.key_5 = 34;
snow.input.Scancodes.key_6 = 35;
snow.input.Scancodes.key_7 = 36;
snow.input.Scancodes.key_8 = 37;
snow.input.Scancodes.key_9 = 38;
snow.input.Scancodes.key_0 = 39;
snow.input.Scancodes.enter = 40;
snow.input.Scancodes.escape = 41;
snow.input.Scancodes.backspace = 42;
snow.input.Scancodes.tab = 43;
snow.input.Scancodes.space = 44;
snow.input.Scancodes.minus = 45;
snow.input.Scancodes.equals = 46;
snow.input.Scancodes.leftbracket = 47;
snow.input.Scancodes.rightbracket = 48;
snow.input.Scancodes.backslash = 49;
snow.input.Scancodes.nonushash = 50;
snow.input.Scancodes.semicolon = 51;
snow.input.Scancodes.apostrophe = 52;
snow.input.Scancodes.grave = 53;
snow.input.Scancodes.comma = 54;
snow.input.Scancodes.period = 55;
snow.input.Scancodes.slash = 56;
snow.input.Scancodes.capslock = 57;
snow.input.Scancodes.f1 = 58;
snow.input.Scancodes.f2 = 59;
snow.input.Scancodes.f3 = 60;
snow.input.Scancodes.f4 = 61;
snow.input.Scancodes.f5 = 62;
snow.input.Scancodes.f6 = 63;
snow.input.Scancodes.f7 = 64;
snow.input.Scancodes.f8 = 65;
snow.input.Scancodes.f9 = 66;
snow.input.Scancodes.f10 = 67;
snow.input.Scancodes.f11 = 68;
snow.input.Scancodes.f12 = 69;
snow.input.Scancodes.printscreen = 70;
snow.input.Scancodes.scrolllock = 71;
snow.input.Scancodes.pause = 72;
snow.input.Scancodes.insert = 73;
snow.input.Scancodes.home = 74;
snow.input.Scancodes.pageup = 75;
snow.input.Scancodes["delete"] = 76;
snow.input.Scancodes.end = 77;
snow.input.Scancodes.pagedown = 78;
snow.input.Scancodes.right = 79;
snow.input.Scancodes.left = 80;
snow.input.Scancodes.down = 81;
snow.input.Scancodes.up = 82;
snow.input.Scancodes.numlockclear = 83;
snow.input.Scancodes.kp_divide = 84;
snow.input.Scancodes.kp_multiply = 85;
snow.input.Scancodes.kp_minus = 86;
snow.input.Scancodes.kp_plus = 87;
snow.input.Scancodes.kp_enter = 88;
snow.input.Scancodes.kp_1 = 89;
snow.input.Scancodes.kp_2 = 90;
snow.input.Scancodes.kp_3 = 91;
snow.input.Scancodes.kp_4 = 92;
snow.input.Scancodes.kp_5 = 93;
snow.input.Scancodes.kp_6 = 94;
snow.input.Scancodes.kp_7 = 95;
snow.input.Scancodes.kp_8 = 96;
snow.input.Scancodes.kp_9 = 97;
snow.input.Scancodes.kp_0 = 98;
snow.input.Scancodes.kp_period = 99;
snow.input.Scancodes.nonusbackslash = 100;
snow.input.Scancodes.application = 101;
snow.input.Scancodes.power = 102;
snow.input.Scancodes.kp_equals = 103;
snow.input.Scancodes.f13 = 104;
snow.input.Scancodes.f14 = 105;
snow.input.Scancodes.f15 = 106;
snow.input.Scancodes.f16 = 107;
snow.input.Scancodes.f17 = 108;
snow.input.Scancodes.f18 = 109;
snow.input.Scancodes.f19 = 110;
snow.input.Scancodes.f20 = 111;
snow.input.Scancodes.f21 = 112;
snow.input.Scancodes.f22 = 113;
snow.input.Scancodes.f23 = 114;
snow.input.Scancodes.f24 = 115;
snow.input.Scancodes.execute = 116;
snow.input.Scancodes.help = 117;
snow.input.Scancodes.menu = 118;
snow.input.Scancodes.select = 119;
snow.input.Scancodes.stop = 120;
snow.input.Scancodes.again = 121;
snow.input.Scancodes.undo = 122;
snow.input.Scancodes.cut = 123;
snow.input.Scancodes.copy = 124;
snow.input.Scancodes.paste = 125;
snow.input.Scancodes.find = 126;
snow.input.Scancodes.mute = 127;
snow.input.Scancodes.volumeup = 128;
snow.input.Scancodes.volumedown = 129;
snow.input.Scancodes.kp_comma = 133;
snow.input.Scancodes.kp_equalsas400 = 134;
snow.input.Scancodes.international1 = 135;
snow.input.Scancodes.international2 = 136;
snow.input.Scancodes.international3 = 137;
snow.input.Scancodes.international4 = 138;
snow.input.Scancodes.international5 = 139;
snow.input.Scancodes.international6 = 140;
snow.input.Scancodes.international7 = 141;
snow.input.Scancodes.international8 = 142;
snow.input.Scancodes.international9 = 143;
snow.input.Scancodes.lang1 = 144;
snow.input.Scancodes.lang2 = 145;
snow.input.Scancodes.lang3 = 146;
snow.input.Scancodes.lang4 = 147;
snow.input.Scancodes.lang5 = 148;
snow.input.Scancodes.lang6 = 149;
snow.input.Scancodes.lang7 = 150;
snow.input.Scancodes.lang8 = 151;
snow.input.Scancodes.lang9 = 152;
snow.input.Scancodes.alterase = 153;
snow.input.Scancodes.sysreq = 154;
snow.input.Scancodes.cancel = 155;
snow.input.Scancodes.clear = 156;
snow.input.Scancodes.prior = 157;
snow.input.Scancodes.return2 = 158;
snow.input.Scancodes.separator = 159;
snow.input.Scancodes.out = 160;
snow.input.Scancodes.oper = 161;
snow.input.Scancodes.clearagain = 162;
snow.input.Scancodes.crsel = 163;
snow.input.Scancodes.exsel = 164;
snow.input.Scancodes.kp_00 = 176;
snow.input.Scancodes.kp_000 = 177;
snow.input.Scancodes.thousandsseparator = 178;
snow.input.Scancodes.decimalseparator = 179;
snow.input.Scancodes.currencyunit = 180;
snow.input.Scancodes.currencysubunit = 181;
snow.input.Scancodes.kp_leftparen = 182;
snow.input.Scancodes.kp_rightparen = 183;
snow.input.Scancodes.kp_leftbrace = 184;
snow.input.Scancodes.kp_rightbrace = 185;
snow.input.Scancodes.kp_tab = 186;
snow.input.Scancodes.kp_backspace = 187;
snow.input.Scancodes.kp_a = 188;
snow.input.Scancodes.kp_b = 189;
snow.input.Scancodes.kp_c = 190;
snow.input.Scancodes.kp_d = 191;
snow.input.Scancodes.kp_e = 192;
snow.input.Scancodes.kp_f = 193;
snow.input.Scancodes.kp_xor = 194;
snow.input.Scancodes.kp_power = 195;
snow.input.Scancodes.kp_percent = 196;
snow.input.Scancodes.kp_less = 197;
snow.input.Scancodes.kp_greater = 198;
snow.input.Scancodes.kp_ampersand = 199;
snow.input.Scancodes.kp_dblampersand = 200;
snow.input.Scancodes.kp_verticalbar = 201;
snow.input.Scancodes.kp_dblverticalbar = 202;
snow.input.Scancodes.kp_colon = 203;
snow.input.Scancodes.kp_hash = 204;
snow.input.Scancodes.kp_space = 205;
snow.input.Scancodes.kp_at = 206;
snow.input.Scancodes.kp_exclam = 207;
snow.input.Scancodes.kp_memstore = 208;
snow.input.Scancodes.kp_memrecall = 209;
snow.input.Scancodes.kp_memclear = 210;
snow.input.Scancodes.kp_memadd = 211;
snow.input.Scancodes.kp_memsubtract = 212;
snow.input.Scancodes.kp_memmultiply = 213;
snow.input.Scancodes.kp_memdivide = 214;
snow.input.Scancodes.kp_plusminus = 215;
snow.input.Scancodes.kp_clear = 216;
snow.input.Scancodes.kp_clearentry = 217;
snow.input.Scancodes.kp_binary = 218;
snow.input.Scancodes.kp_octal = 219;
snow.input.Scancodes.kp_decimal = 220;
snow.input.Scancodes.kp_hexadecimal = 221;
snow.input.Scancodes.lctrl = 224;
snow.input.Scancodes.lshift = 225;
snow.input.Scancodes.lalt = 226;
snow.input.Scancodes.lmeta = 227;
snow.input.Scancodes.rctrl = 228;
snow.input.Scancodes.rshift = 229;
snow.input.Scancodes.ralt = 230;
snow.input.Scancodes.rmeta = 231;
snow.input.Scancodes.mode = 257;
snow.input.Scancodes.audionext = 258;
snow.input.Scancodes.audioprev = 259;
snow.input.Scancodes.audiostop = 260;
snow.input.Scancodes.audioplay = 261;
snow.input.Scancodes.audiomute = 262;
snow.input.Scancodes.mediaselect = 263;
snow.input.Scancodes.www = 264;
snow.input.Scancodes.mail = 265;
snow.input.Scancodes.calculator = 266;
snow.input.Scancodes.computer = 267;
snow.input.Scancodes.ac_search = 268;
snow.input.Scancodes.ac_home = 269;
snow.input.Scancodes.ac_back = 270;
snow.input.Scancodes.ac_forward = 271;
snow.input.Scancodes.ac_stop = 272;
snow.input.Scancodes.ac_refresh = 273;
snow.input.Scancodes.ac_bookmarks = 274;
snow.input.Scancodes.brightnessdown = 275;
snow.input.Scancodes.brightnessup = 276;
snow.input.Scancodes.displayswitch = 277;
snow.input.Scancodes.kbdillumtoggle = 278;
snow.input.Scancodes.kbdillumdown = 279;
snow.input.Scancodes.kbdillumup = 280;
snow.input.Scancodes.eject = 281;
snow.input.Scancodes.sleep = 282;
snow.input.Scancodes.app1 = 283;
snow.input.Scancodes.app2 = 284;
snow.input.Scancodes.scancode_names = [null,null,null,null,"A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z","1","2","3","4","5","6","7","8","9","0","Enter","Escape","Backspace","Tab","Space","-","=","[","]","\\","#",";","'","`",",",".","/","CapsLock","F1","F2","F3","F4","F5","F6","F7","F8","F9","F10","F11","F12","PrintScreen","ScrollLock","Pause","Insert","Home","PageUp","Delete","End","PageDown","Right","Left","Down","Up","Numlock","Keypad /","Keypad *","Keypad -","Keypad +","Keypad Enter","Keypad 1","Keypad 2","Keypad 3","Keypad 4","Keypad 5","Keypad 6","Keypad 7","Keypad 8","Keypad 9","Keypad 0","Keypad .",null,"Application","Power","Keypad =","F13","F14","F15","F16","F17","F18","F19","F20","F21","F22","F23","F24","Execute","Help","Menu","Select","Stop","Again","Undo","Cut","Copy","Paste","Find","Mute","VolumeUp","VolumeDown",null,null,null,"Keypad ,","Keypad = (AS400)",null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,"AltErase","SysReq","Cancel","Clear","Prior","Enter","Separator","Out","Oper","Clear / Again","CrSel","ExSel",null,null,null,null,null,null,null,null,null,null,null,"Keypad 00","Keypad 000","ThousandsSeparator","DecimalSeparator","CurrencyUnit","CurrencySubUnit","Keypad (","Keypad )","Keypad {","Keypad }","Keypad Tab","Keypad Backspace","Keypad A","Keypad B","Keypad C","Keypad D","Keypad E","Keypad F","Keypad XOR","Keypad ^","Keypad %","Keypad <","Keypad >","Keypad &","Keypad &&","Keypad |","Keypad ||","Keypad :","Keypad #","Keypad Space","Keypad @","Keypad !","Keypad MemStore","Keypad MemRecall","Keypad MemClear","Keypad MemAdd","Keypad MemSubtract","Keypad MemMultiply","Keypad MemDivide","Keypad +/-","Keypad Clear","Keypad ClearEntry","Keypad Binary","Keypad Octal","Keypad Decimal","Keypad Hexadecimal",null,null,"Left Ctrl","Left Shift","Left Alt","Left Meta","Right Ctrl","Right Shift","Right Alt","Right Meta",null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,"ModeSwitch","AudioNext","AudioPrev","AudioStop","AudioPlay","AudioMute","MediaSelect","WWW","Mail","Calculator","Computer","AC Search","AC Home","AC Back","AC Forward","AC Stop","AC Refresh","AC Bookmarks","BrightnessDown","BrightnessUp","DisplaySwitch","KBDIllumToggle","KBDIllumDown","KBDIllumUp","Eject","Sleep"];
snow.input.Keycodes.unknown = 0;
snow.input.Keycodes.enter = 13;
snow.input.Keycodes.escape = 27;
snow.input.Keycodes.backspace = 8;
snow.input.Keycodes.tab = 9;
snow.input.Keycodes.space = 32;
snow.input.Keycodes.exclaim = 33;
snow.input.Keycodes.quotedbl = 34;
snow.input.Keycodes.hash = 35;
snow.input.Keycodes.percent = 37;
snow.input.Keycodes.dollar = 36;
snow.input.Keycodes.ampersand = 38;
snow.input.Keycodes.quote = 39;
snow.input.Keycodes.leftparen = 40;
snow.input.Keycodes.rightparen = 41;
snow.input.Keycodes.asterisk = 42;
snow.input.Keycodes.plus = 43;
snow.input.Keycodes.comma = 44;
snow.input.Keycodes.minus = 45;
snow.input.Keycodes.period = 46;
snow.input.Keycodes.slash = 47;
snow.input.Keycodes.key_0 = 48;
snow.input.Keycodes.key_1 = 49;
snow.input.Keycodes.key_2 = 50;
snow.input.Keycodes.key_3 = 51;
snow.input.Keycodes.key_4 = 52;
snow.input.Keycodes.key_5 = 53;
snow.input.Keycodes.key_6 = 54;
snow.input.Keycodes.key_7 = 55;
snow.input.Keycodes.key_8 = 56;
snow.input.Keycodes.key_9 = 57;
snow.input.Keycodes.colon = 58;
snow.input.Keycodes.semicolon = 59;
snow.input.Keycodes.less = 60;
snow.input.Keycodes.equals = 61;
snow.input.Keycodes.greater = 62;
snow.input.Keycodes.question = 63;
snow.input.Keycodes.at = 64;
snow.input.Keycodes.leftbracket = 91;
snow.input.Keycodes.backslash = 92;
snow.input.Keycodes.rightbracket = 93;
snow.input.Keycodes.caret = 94;
snow.input.Keycodes.underscore = 95;
snow.input.Keycodes.backquote = 96;
snow.input.Keycodes.key_a = 97;
snow.input.Keycodes.key_b = 98;
snow.input.Keycodes.key_c = 99;
snow.input.Keycodes.key_d = 100;
snow.input.Keycodes.key_e = 101;
snow.input.Keycodes.key_f = 102;
snow.input.Keycodes.key_g = 103;
snow.input.Keycodes.key_h = 104;
snow.input.Keycodes.key_i = 105;
snow.input.Keycodes.key_j = 106;
snow.input.Keycodes.key_k = 107;
snow.input.Keycodes.key_l = 108;
snow.input.Keycodes.key_m = 109;
snow.input.Keycodes.key_n = 110;
snow.input.Keycodes.key_o = 111;
snow.input.Keycodes.key_p = 112;
snow.input.Keycodes.key_q = 113;
snow.input.Keycodes.key_r = 114;
snow.input.Keycodes.key_s = 115;
snow.input.Keycodes.key_t = 116;
snow.input.Keycodes.key_u = 117;
snow.input.Keycodes.key_v = 118;
snow.input.Keycodes.key_w = 119;
snow.input.Keycodes.key_x = 120;
snow.input.Keycodes.key_y = 121;
snow.input.Keycodes.key_z = 122;
snow.input.Keycodes.capslock = snow.input.Keycodes.from_scan(snow.input.Scancodes.capslock);
snow.input.Keycodes.f1 = snow.input.Keycodes.from_scan(snow.input.Scancodes.f1);
snow.input.Keycodes.f2 = snow.input.Keycodes.from_scan(snow.input.Scancodes.f2);
snow.input.Keycodes.f3 = snow.input.Keycodes.from_scan(snow.input.Scancodes.f3);
snow.input.Keycodes.f4 = snow.input.Keycodes.from_scan(snow.input.Scancodes.f4);
snow.input.Keycodes.f5 = snow.input.Keycodes.from_scan(snow.input.Scancodes.f5);
snow.input.Keycodes.f6 = snow.input.Keycodes.from_scan(snow.input.Scancodes.f6);
snow.input.Keycodes.f7 = snow.input.Keycodes.from_scan(snow.input.Scancodes.f7);
snow.input.Keycodes.f8 = snow.input.Keycodes.from_scan(snow.input.Scancodes.f8);
snow.input.Keycodes.f9 = snow.input.Keycodes.from_scan(snow.input.Scancodes.f9);
snow.input.Keycodes.f10 = snow.input.Keycodes.from_scan(snow.input.Scancodes.f10);
snow.input.Keycodes.f11 = snow.input.Keycodes.from_scan(snow.input.Scancodes.f11);
snow.input.Keycodes.f12 = snow.input.Keycodes.from_scan(snow.input.Scancodes.f12);
snow.input.Keycodes.printscreen = snow.input.Keycodes.from_scan(snow.input.Scancodes.printscreen);
snow.input.Keycodes.scrolllock = snow.input.Keycodes.from_scan(snow.input.Scancodes.scrolllock);
snow.input.Keycodes.pause = snow.input.Keycodes.from_scan(snow.input.Scancodes.pause);
snow.input.Keycodes.insert = snow.input.Keycodes.from_scan(snow.input.Scancodes.insert);
snow.input.Keycodes.home = snow.input.Keycodes.from_scan(snow.input.Scancodes.home);
snow.input.Keycodes.pageup = snow.input.Keycodes.from_scan(snow.input.Scancodes.pageup);
snow.input.Keycodes["delete"] = 127;
snow.input.Keycodes.end = snow.input.Keycodes.from_scan(snow.input.Scancodes.end);
snow.input.Keycodes.pagedown = snow.input.Keycodes.from_scan(snow.input.Scancodes.pagedown);
snow.input.Keycodes.right = snow.input.Keycodes.from_scan(snow.input.Scancodes.right);
snow.input.Keycodes.left = snow.input.Keycodes.from_scan(snow.input.Scancodes.left);
snow.input.Keycodes.down = snow.input.Keycodes.from_scan(snow.input.Scancodes.down);
snow.input.Keycodes.up = snow.input.Keycodes.from_scan(snow.input.Scancodes.up);
snow.input.Keycodes.numlockclear = snow.input.Keycodes.from_scan(snow.input.Scancodes.numlockclear);
snow.input.Keycodes.kp_divide = snow.input.Keycodes.from_scan(snow.input.Scancodes.kp_divide);
snow.input.Keycodes.kp_multiply = snow.input.Keycodes.from_scan(snow.input.Scancodes.kp_multiply);
snow.input.Keycodes.kp_minus = snow.input.Keycodes.from_scan(snow.input.Scancodes.kp_minus);
snow.input.Keycodes.kp_plus = snow.input.Keycodes.from_scan(snow.input.Scancodes.kp_plus);
snow.input.Keycodes.kp_enter = snow.input.Keycodes.from_scan(snow.input.Scancodes.kp_enter);
snow.input.Keycodes.kp_1 = snow.input.Keycodes.from_scan(snow.input.Scancodes.kp_1);
snow.input.Keycodes.kp_2 = snow.input.Keycodes.from_scan(snow.input.Scancodes.kp_2);
snow.input.Keycodes.kp_3 = snow.input.Keycodes.from_scan(snow.input.Scancodes.kp_3);
snow.input.Keycodes.kp_4 = snow.input.Keycodes.from_scan(snow.input.Scancodes.kp_4);
snow.input.Keycodes.kp_5 = snow.input.Keycodes.from_scan(snow.input.Scancodes.kp_5);
snow.input.Keycodes.kp_6 = snow.input.Keycodes.from_scan(snow.input.Scancodes.kp_6);
snow.input.Keycodes.kp_7 = snow.input.Keycodes.from_scan(snow.input.Scancodes.kp_7);
snow.input.Keycodes.kp_8 = snow.input.Keycodes.from_scan(snow.input.Scancodes.kp_8);
snow.input.Keycodes.kp_9 = snow.input.Keycodes.from_scan(snow.input.Scancodes.kp_9);
snow.input.Keycodes.kp_0 = snow.input.Keycodes.from_scan(snow.input.Scancodes.kp_0);
snow.input.Keycodes.kp_period = snow.input.Keycodes.from_scan(snow.input.Scancodes.kp_period);
snow.input.Keycodes.application = snow.input.Keycodes.from_scan(snow.input.Scancodes.application);
snow.input.Keycodes.power = snow.input.Keycodes.from_scan(snow.input.Scancodes.power);
snow.input.Keycodes.kp_equals = snow.input.Keycodes.from_scan(snow.input.Scancodes.kp_equals);
snow.input.Keycodes.f13 = snow.input.Keycodes.from_scan(snow.input.Scancodes.f13);
snow.input.Keycodes.f14 = snow.input.Keycodes.from_scan(snow.input.Scancodes.f14);
snow.input.Keycodes.f15 = snow.input.Keycodes.from_scan(snow.input.Scancodes.f15);
snow.input.Keycodes.f16 = snow.input.Keycodes.from_scan(snow.input.Scancodes.f16);
snow.input.Keycodes.f17 = snow.input.Keycodes.from_scan(snow.input.Scancodes.f17);
snow.input.Keycodes.f18 = snow.input.Keycodes.from_scan(snow.input.Scancodes.f18);
snow.input.Keycodes.f19 = snow.input.Keycodes.from_scan(snow.input.Scancodes.f19);
snow.input.Keycodes.f20 = snow.input.Keycodes.from_scan(snow.input.Scancodes.f20);
snow.input.Keycodes.f21 = snow.input.Keycodes.from_scan(snow.input.Scancodes.f21);
snow.input.Keycodes.f22 = snow.input.Keycodes.from_scan(snow.input.Scancodes.f22);
snow.input.Keycodes.f23 = snow.input.Keycodes.from_scan(snow.input.Scancodes.f23);
snow.input.Keycodes.f24 = snow.input.Keycodes.from_scan(snow.input.Scancodes.f24);
snow.input.Keycodes.execute = snow.input.Keycodes.from_scan(snow.input.Scancodes.execute);
snow.input.Keycodes.help = snow.input.Keycodes.from_scan(snow.input.Scancodes.help);
snow.input.Keycodes.menu = snow.input.Keycodes.from_scan(snow.input.Scancodes.menu);
snow.input.Keycodes.select = snow.input.Keycodes.from_scan(snow.input.Scancodes.select);
snow.input.Keycodes.stop = snow.input.Keycodes.from_scan(snow.input.Scancodes.stop);
snow.input.Keycodes.again = snow.input.Keycodes.from_scan(snow.input.Scancodes.again);
snow.input.Keycodes.undo = snow.input.Keycodes.from_scan(snow.input.Scancodes.undo);
snow.input.Keycodes.cut = snow.input.Keycodes.from_scan(snow.input.Scancodes.cut);
snow.input.Keycodes.copy = snow.input.Keycodes.from_scan(snow.input.Scancodes.copy);
snow.input.Keycodes.paste = snow.input.Keycodes.from_scan(snow.input.Scancodes.paste);
snow.input.Keycodes.find = snow.input.Keycodes.from_scan(snow.input.Scancodes.find);
snow.input.Keycodes.mute = snow.input.Keycodes.from_scan(snow.input.Scancodes.mute);
snow.input.Keycodes.volumeup = snow.input.Keycodes.from_scan(snow.input.Scancodes.volumeup);
snow.input.Keycodes.volumedown = snow.input.Keycodes.from_scan(snow.input.Scancodes.volumedown);
snow.input.Keycodes.kp_comma = snow.input.Keycodes.from_scan(snow.input.Scancodes.kp_comma);
snow.input.Keycodes.kp_equalsas400 = snow.input.Keycodes.from_scan(snow.input.Scancodes.kp_equalsas400);
snow.input.Keycodes.alterase = snow.input.Keycodes.from_scan(snow.input.Scancodes.alterase);
snow.input.Keycodes.sysreq = snow.input.Keycodes.from_scan(snow.input.Scancodes.sysreq);
snow.input.Keycodes.cancel = snow.input.Keycodes.from_scan(snow.input.Scancodes.cancel);
snow.input.Keycodes.clear = snow.input.Keycodes.from_scan(snow.input.Scancodes.clear);
snow.input.Keycodes.prior = snow.input.Keycodes.from_scan(snow.input.Scancodes.prior);
snow.input.Keycodes.return2 = snow.input.Keycodes.from_scan(snow.input.Scancodes.return2);
snow.input.Keycodes.separator = snow.input.Keycodes.from_scan(snow.input.Scancodes.separator);
snow.input.Keycodes.out = snow.input.Keycodes.from_scan(snow.input.Scancodes.out);
snow.input.Keycodes.oper = snow.input.Keycodes.from_scan(snow.input.Scancodes.oper);
snow.input.Keycodes.clearagain = snow.input.Keycodes.from_scan(snow.input.Scancodes.clearagain);
snow.input.Keycodes.crsel = snow.input.Keycodes.from_scan(snow.input.Scancodes.crsel);
snow.input.Keycodes.exsel = snow.input.Keycodes.from_scan(snow.input.Scancodes.exsel);
snow.input.Keycodes.kp_00 = snow.input.Keycodes.from_scan(snow.input.Scancodes.kp_00);
snow.input.Keycodes.kp_000 = snow.input.Keycodes.from_scan(snow.input.Scancodes.kp_000);
snow.input.Keycodes.thousandsseparator = snow.input.Keycodes.from_scan(snow.input.Scancodes.thousandsseparator);
snow.input.Keycodes.decimalseparator = snow.input.Keycodes.from_scan(snow.input.Scancodes.decimalseparator);
snow.input.Keycodes.currencyunit = snow.input.Keycodes.from_scan(snow.input.Scancodes.currencyunit);
snow.input.Keycodes.currencysubunit = snow.input.Keycodes.from_scan(snow.input.Scancodes.currencysubunit);
snow.input.Keycodes.kp_leftparen = snow.input.Keycodes.from_scan(snow.input.Scancodes.kp_leftparen);
snow.input.Keycodes.kp_rightparen = snow.input.Keycodes.from_scan(snow.input.Scancodes.kp_rightparen);
snow.input.Keycodes.kp_leftbrace = snow.input.Keycodes.from_scan(snow.input.Scancodes.kp_leftbrace);
snow.input.Keycodes.kp_rightbrace = snow.input.Keycodes.from_scan(snow.input.Scancodes.kp_rightbrace);
snow.input.Keycodes.kp_tab = snow.input.Keycodes.from_scan(snow.input.Scancodes.kp_tab);
snow.input.Keycodes.kp_backspace = snow.input.Keycodes.from_scan(snow.input.Scancodes.kp_backspace);
snow.input.Keycodes.kp_a = snow.input.Keycodes.from_scan(snow.input.Scancodes.kp_a);
snow.input.Keycodes.kp_b = snow.input.Keycodes.from_scan(snow.input.Scancodes.kp_b);
snow.input.Keycodes.kp_c = snow.input.Keycodes.from_scan(snow.input.Scancodes.kp_c);
snow.input.Keycodes.kp_d = snow.input.Keycodes.from_scan(snow.input.Scancodes.kp_d);
snow.input.Keycodes.kp_e = snow.input.Keycodes.from_scan(snow.input.Scancodes.kp_e);
snow.input.Keycodes.kp_f = snow.input.Keycodes.from_scan(snow.input.Scancodes.kp_f);
snow.input.Keycodes.kp_xor = snow.input.Keycodes.from_scan(snow.input.Scancodes.kp_xor);
snow.input.Keycodes.kp_power = snow.input.Keycodes.from_scan(snow.input.Scancodes.kp_power);
snow.input.Keycodes.kp_percent = snow.input.Keycodes.from_scan(snow.input.Scancodes.kp_percent);
snow.input.Keycodes.kp_less = snow.input.Keycodes.from_scan(snow.input.Scancodes.kp_less);
snow.input.Keycodes.kp_greater = snow.input.Keycodes.from_scan(snow.input.Scancodes.kp_greater);
snow.input.Keycodes.kp_ampersand = snow.input.Keycodes.from_scan(snow.input.Scancodes.kp_ampersand);
snow.input.Keycodes.kp_dblampersand = snow.input.Keycodes.from_scan(snow.input.Scancodes.kp_dblampersand);
snow.input.Keycodes.kp_verticalbar = snow.input.Keycodes.from_scan(snow.input.Scancodes.kp_verticalbar);
snow.input.Keycodes.kp_dblverticalbar = snow.input.Keycodes.from_scan(snow.input.Scancodes.kp_dblverticalbar);
snow.input.Keycodes.kp_colon = snow.input.Keycodes.from_scan(snow.input.Scancodes.kp_colon);
snow.input.Keycodes.kp_hash = snow.input.Keycodes.from_scan(snow.input.Scancodes.kp_hash);
snow.input.Keycodes.kp_space = snow.input.Keycodes.from_scan(snow.input.Scancodes.kp_space);
snow.input.Keycodes.kp_at = snow.input.Keycodes.from_scan(snow.input.Scancodes.kp_at);
snow.input.Keycodes.kp_exclam = snow.input.Keycodes.from_scan(snow.input.Scancodes.kp_exclam);
snow.input.Keycodes.kp_memstore = snow.input.Keycodes.from_scan(snow.input.Scancodes.kp_memstore);
snow.input.Keycodes.kp_memrecall = snow.input.Keycodes.from_scan(snow.input.Scancodes.kp_memrecall);
snow.input.Keycodes.kp_memclear = snow.input.Keycodes.from_scan(snow.input.Scancodes.kp_memclear);
snow.input.Keycodes.kp_memadd = snow.input.Keycodes.from_scan(snow.input.Scancodes.kp_memadd);
snow.input.Keycodes.kp_memsubtract = snow.input.Keycodes.from_scan(snow.input.Scancodes.kp_memsubtract);
snow.input.Keycodes.kp_memmultiply = snow.input.Keycodes.from_scan(snow.input.Scancodes.kp_memmultiply);
snow.input.Keycodes.kp_memdivide = snow.input.Keycodes.from_scan(snow.input.Scancodes.kp_memdivide);
snow.input.Keycodes.kp_plusminus = snow.input.Keycodes.from_scan(snow.input.Scancodes.kp_plusminus);
snow.input.Keycodes.kp_clear = snow.input.Keycodes.from_scan(snow.input.Scancodes.kp_clear);
snow.input.Keycodes.kp_clearentry = snow.input.Keycodes.from_scan(snow.input.Scancodes.kp_clearentry);
snow.input.Keycodes.kp_binary = snow.input.Keycodes.from_scan(snow.input.Scancodes.kp_binary);
snow.input.Keycodes.kp_octal = snow.input.Keycodes.from_scan(snow.input.Scancodes.kp_octal);
snow.input.Keycodes.kp_decimal = snow.input.Keycodes.from_scan(snow.input.Scancodes.kp_decimal);
snow.input.Keycodes.kp_hexadecimal = snow.input.Keycodes.from_scan(snow.input.Scancodes.kp_hexadecimal);
snow.input.Keycodes.lctrl = snow.input.Keycodes.from_scan(snow.input.Scancodes.lctrl);
snow.input.Keycodes.lshift = snow.input.Keycodes.from_scan(snow.input.Scancodes.lshift);
snow.input.Keycodes.lalt = snow.input.Keycodes.from_scan(snow.input.Scancodes.lalt);
snow.input.Keycodes.lmeta = snow.input.Keycodes.from_scan(snow.input.Scancodes.lmeta);
snow.input.Keycodes.rctrl = snow.input.Keycodes.from_scan(snow.input.Scancodes.rctrl);
snow.input.Keycodes.rshift = snow.input.Keycodes.from_scan(snow.input.Scancodes.rshift);
snow.input.Keycodes.ralt = snow.input.Keycodes.from_scan(snow.input.Scancodes.ralt);
snow.input.Keycodes.rmeta = snow.input.Keycodes.from_scan(snow.input.Scancodes.rmeta);
snow.input.Keycodes.mode = snow.input.Keycodes.from_scan(snow.input.Scancodes.mode);
snow.input.Keycodes.audionext = snow.input.Keycodes.from_scan(snow.input.Scancodes.audionext);
snow.input.Keycodes.audioprev = snow.input.Keycodes.from_scan(snow.input.Scancodes.audioprev);
snow.input.Keycodes.audiostop = snow.input.Keycodes.from_scan(snow.input.Scancodes.audiostop);
snow.input.Keycodes.audioplay = snow.input.Keycodes.from_scan(snow.input.Scancodes.audioplay);
snow.input.Keycodes.audiomute = snow.input.Keycodes.from_scan(snow.input.Scancodes.audiomute);
snow.input.Keycodes.mediaselect = snow.input.Keycodes.from_scan(snow.input.Scancodes.mediaselect);
snow.input.Keycodes.www = snow.input.Keycodes.from_scan(snow.input.Scancodes.www);
snow.input.Keycodes.mail = snow.input.Keycodes.from_scan(snow.input.Scancodes.mail);
snow.input.Keycodes.calculator = snow.input.Keycodes.from_scan(snow.input.Scancodes.calculator);
snow.input.Keycodes.computer = snow.input.Keycodes.from_scan(snow.input.Scancodes.computer);
snow.input.Keycodes.ac_search = snow.input.Keycodes.from_scan(snow.input.Scancodes.ac_search);
snow.input.Keycodes.ac_home = snow.input.Keycodes.from_scan(snow.input.Scancodes.ac_home);
snow.input.Keycodes.ac_back = snow.input.Keycodes.from_scan(snow.input.Scancodes.ac_back);
snow.input.Keycodes.ac_forward = snow.input.Keycodes.from_scan(snow.input.Scancodes.ac_forward);
snow.input.Keycodes.ac_stop = snow.input.Keycodes.from_scan(snow.input.Scancodes.ac_stop);
snow.input.Keycodes.ac_refresh = snow.input.Keycodes.from_scan(snow.input.Scancodes.ac_refresh);
snow.input.Keycodes.ac_bookmarks = snow.input.Keycodes.from_scan(snow.input.Scancodes.ac_bookmarks);
snow.input.Keycodes.brightnessdown = snow.input.Keycodes.from_scan(snow.input.Scancodes.brightnessdown);
snow.input.Keycodes.brightnessup = snow.input.Keycodes.from_scan(snow.input.Scancodes.brightnessup);
snow.input.Keycodes.displayswitch = snow.input.Keycodes.from_scan(snow.input.Scancodes.displayswitch);
snow.input.Keycodes.kbdillumtoggle = snow.input.Keycodes.from_scan(snow.input.Scancodes.kbdillumtoggle);
snow.input.Keycodes.kbdillumdown = snow.input.Keycodes.from_scan(snow.input.Scancodes.kbdillumdown);
snow.input.Keycodes.kbdillumup = snow.input.Keycodes.from_scan(snow.input.Scancodes.kbdillumup);
snow.input.Keycodes.eject = snow.input.Keycodes.from_scan(snow.input.Scancodes.eject);
snow.input.Keycodes.sleep = snow.input.Keycodes.from_scan(snow.input.Scancodes.sleep);
snow.platform.web.input.DOMKeys.dom_shift = 16;
snow.platform.web.input.DOMKeys.dom_ctrl = 17;
snow.platform.web.input.DOMKeys.dom_alt = 18;
snow.platform.web.input.DOMKeys.dom_capslock = 20;
snow.platform.web.input.DOMKeys.dom_pageup = 33;
snow.platform.web.input.DOMKeys.dom_pagedown = 34;
snow.platform.web.input.DOMKeys.dom_end = 35;
snow.platform.web.input.DOMKeys.dom_home = 36;
snow.platform.web.input.DOMKeys.dom_left = 37;
snow.platform.web.input.DOMKeys.dom_up = 38;
snow.platform.web.input.DOMKeys.dom_right = 39;
snow.platform.web.input.DOMKeys.dom_down = 40;
snow.platform.web.input.DOMKeys.dom_printscr = 44;
snow.platform.web.input.DOMKeys.dom_insert = 45;
snow.platform.web.input.DOMKeys.dom_delete = 46;
snow.platform.web.input.DOMKeys.dom_lmeta = 91;
snow.platform.web.input.DOMKeys.dom_rmeta = 93;
snow.platform.web.input.DOMKeys.dom_kp_0 = 96;
snow.platform.web.input.DOMKeys.dom_kp_1 = 97;
snow.platform.web.input.DOMKeys.dom_kp_2 = 98;
snow.platform.web.input.DOMKeys.dom_kp_3 = 99;
snow.platform.web.input.DOMKeys.dom_kp_4 = 100;
snow.platform.web.input.DOMKeys.dom_kp_5 = 101;
snow.platform.web.input.DOMKeys.dom_kp_6 = 102;
snow.platform.web.input.DOMKeys.dom_kp_7 = 103;
snow.platform.web.input.DOMKeys.dom_kp_8 = 104;
snow.platform.web.input.DOMKeys.dom_kp_9 = 105;
snow.platform.web.input.DOMKeys.dom_kp_multiply = 106;
snow.platform.web.input.DOMKeys.dom_kp_plus = 107;
snow.platform.web.input.DOMKeys.dom_kp_minus = 109;
snow.platform.web.input.DOMKeys.dom_kp_decimal = 110;
snow.platform.web.input.DOMKeys.dom_kp_divide = 111;
snow.platform.web.input.DOMKeys.dom_kp_numlock = 144;
snow.platform.web.input.DOMKeys.dom_f1 = 112;
snow.platform.web.input.DOMKeys.dom_f2 = 113;
snow.platform.web.input.DOMKeys.dom_f3 = 114;
snow.platform.web.input.DOMKeys.dom_f4 = 115;
snow.platform.web.input.DOMKeys.dom_f5 = 116;
snow.platform.web.input.DOMKeys.dom_f6 = 117;
snow.platform.web.input.DOMKeys.dom_f7 = 118;
snow.platform.web.input.DOMKeys.dom_f8 = 119;
snow.platform.web.input.DOMKeys.dom_f9 = 120;
snow.platform.web.input.DOMKeys.dom_f10 = 121;
snow.platform.web.input.DOMKeys.dom_f11 = 122;
snow.platform.web.input.DOMKeys.dom_f12 = 123;
snow.platform.web.input.DOMKeys.dom_f13 = 124;
snow.platform.web.input.DOMKeys.dom_f14 = 125;
snow.platform.web.input.DOMKeys.dom_f15 = 126;
snow.platform.web.input.DOMKeys.dom_f16 = 127;
snow.platform.web.input.DOMKeys.dom_f17 = 128;
snow.platform.web.input.DOMKeys.dom_f18 = 129;
snow.platform.web.input.DOMKeys.dom_f19 = 130;
snow.platform.web.input.DOMKeys.dom_f20 = 131;
snow.platform.web.input.DOMKeys.dom_f21 = 132;
snow.platform.web.input.DOMKeys.dom_f22 = 133;
snow.platform.web.input.DOMKeys.dom_f23 = 134;
snow.platform.web.input.DOMKeys.dom_f24 = 135;
snow.platform.web.input.DOMKeys.dom_caret = 160;
snow.platform.web.input.DOMKeys.dom_exclaim = 161;
snow.platform.web.input.DOMKeys.dom_quotedbl = 162;
snow.platform.web.input.DOMKeys.dom_hash = 163;
snow.platform.web.input.DOMKeys.dom_dollar = 164;
snow.platform.web.input.DOMKeys.dom_percent = 165;
snow.platform.web.input.DOMKeys.dom_ampersand = 166;
snow.platform.web.input.DOMKeys.dom_underscore = 167;
snow.platform.web.input.DOMKeys.dom_leftparen = 168;
snow.platform.web.input.DOMKeys.dom_rightparen = 169;
snow.platform.web.input.DOMKeys.dom_asterisk = 170;
snow.platform.web.input.DOMKeys.dom_plus = 171;
snow.platform.web.input.DOMKeys.dom_pipe = 172;
snow.platform.web.input.DOMKeys.dom_minus = 173;
snow.platform.web.input.DOMKeys.dom_leftbrace = 174;
snow.platform.web.input.DOMKeys.dom_rightbrace = 175;
snow.platform.web.input.DOMKeys.dom_tilde = 176;
snow.platform.web.input.DOMKeys.dom_audiomute = 181;
snow.platform.web.input.DOMKeys.dom_volumedown = 182;
snow.platform.web.input.DOMKeys.dom_volumeup = 183;
snow.platform.web.input.DOMKeys.dom_comma = 188;
snow.platform.web.input.DOMKeys.dom_period = 190;
snow.platform.web.input.DOMKeys.dom_slash = 191;
snow.platform.web.input.DOMKeys.dom_backquote = 192;
snow.platform.web.input.DOMKeys.dom_leftbracket = 219;
snow.platform.web.input.DOMKeys.dom_rightbracket = 221;
snow.platform.web.input.DOMKeys.dom_backslash = 220;
snow.platform.web.input.DOMKeys.dom_quote = 222;
snow.platform.web.input.DOMKeys.dom_meta = 224;
snow.platform.web.render.opengl.GL.DEPTH_BUFFER_BIT = 256;
snow.platform.web.render.opengl.GL.STENCIL_BUFFER_BIT = 1024;
snow.platform.web.render.opengl.GL.COLOR_BUFFER_BIT = 16384;
snow.platform.web.render.opengl.GL.POINTS = 0;
snow.platform.web.render.opengl.GL.LINES = 1;
snow.platform.web.render.opengl.GL.LINE_LOOP = 2;
snow.platform.web.render.opengl.GL.LINE_STRIP = 3;
snow.platform.web.render.opengl.GL.TRIANGLES = 4;
snow.platform.web.render.opengl.GL.TRIANGLE_STRIP = 5;
snow.platform.web.render.opengl.GL.TRIANGLE_FAN = 6;
snow.platform.web.render.opengl.GL.ZERO = 0;
snow.platform.web.render.opengl.GL.ONE = 1;
snow.platform.web.render.opengl.GL.SRC_COLOR = 768;
snow.platform.web.render.opengl.GL.ONE_MINUS_SRC_COLOR = 769;
snow.platform.web.render.opengl.GL.SRC_ALPHA = 770;
snow.platform.web.render.opengl.GL.ONE_MINUS_SRC_ALPHA = 771;
snow.platform.web.render.opengl.GL.DST_ALPHA = 772;
snow.platform.web.render.opengl.GL.ONE_MINUS_DST_ALPHA = 773;
snow.platform.web.render.opengl.GL.DST_COLOR = 774;
snow.platform.web.render.opengl.GL.ONE_MINUS_DST_COLOR = 775;
snow.platform.web.render.opengl.GL.SRC_ALPHA_SATURATE = 776;
snow.platform.web.render.opengl.GL.FUNC_ADD = 32774;
snow.platform.web.render.opengl.GL.BLEND_EQUATION = 32777;
snow.platform.web.render.opengl.GL.BLEND_EQUATION_RGB = 32777;
snow.platform.web.render.opengl.GL.BLEND_EQUATION_ALPHA = 34877;
snow.platform.web.render.opengl.GL.FUNC_SUBTRACT = 32778;
snow.platform.web.render.opengl.GL.FUNC_REVERSE_SUBTRACT = 32779;
snow.platform.web.render.opengl.GL.BLEND_DST_RGB = 32968;
snow.platform.web.render.opengl.GL.BLEND_SRC_RGB = 32969;
snow.platform.web.render.opengl.GL.BLEND_DST_ALPHA = 32970;
snow.platform.web.render.opengl.GL.BLEND_SRC_ALPHA = 32971;
snow.platform.web.render.opengl.GL.CONSTANT_COLOR = 32769;
snow.platform.web.render.opengl.GL.ONE_MINUS_CONSTANT_COLOR = 32770;
snow.platform.web.render.opengl.GL.CONSTANT_ALPHA = 32771;
snow.platform.web.render.opengl.GL.ONE_MINUS_CONSTANT_ALPHA = 32772;
snow.platform.web.render.opengl.GL.BLEND_COLOR = 32773;
snow.platform.web.render.opengl.GL.ARRAY_BUFFER = 34962;
snow.platform.web.render.opengl.GL.ELEMENT_ARRAY_BUFFER = 34963;
snow.platform.web.render.opengl.GL.ARRAY_BUFFER_BINDING = 34964;
snow.platform.web.render.opengl.GL.ELEMENT_ARRAY_BUFFER_BINDING = 34965;
snow.platform.web.render.opengl.GL.STREAM_DRAW = 35040;
snow.platform.web.render.opengl.GL.STATIC_DRAW = 35044;
snow.platform.web.render.opengl.GL.DYNAMIC_DRAW = 35048;
snow.platform.web.render.opengl.GL.BUFFER_SIZE = 34660;
snow.platform.web.render.opengl.GL.BUFFER_USAGE = 34661;
snow.platform.web.render.opengl.GL.CURRENT_VERTEX_ATTRIB = 34342;
snow.platform.web.render.opengl.GL.FRONT = 1028;
snow.platform.web.render.opengl.GL.BACK = 1029;
snow.platform.web.render.opengl.GL.FRONT_AND_BACK = 1032;
snow.platform.web.render.opengl.GL.CULL_FACE = 2884;
snow.platform.web.render.opengl.GL.BLEND = 3042;
snow.platform.web.render.opengl.GL.DITHER = 3024;
snow.platform.web.render.opengl.GL.STENCIL_TEST = 2960;
snow.platform.web.render.opengl.GL.DEPTH_TEST = 2929;
snow.platform.web.render.opengl.GL.SCISSOR_TEST = 3089;
snow.platform.web.render.opengl.GL.POLYGON_OFFSET_FILL = 32823;
snow.platform.web.render.opengl.GL.SAMPLE_ALPHA_TO_COVERAGE = 32926;
snow.platform.web.render.opengl.GL.SAMPLE_COVERAGE = 32928;
snow.platform.web.render.opengl.GL.NO_ERROR = 0;
snow.platform.web.render.opengl.GL.INVALID_ENUM = 1280;
snow.platform.web.render.opengl.GL.INVALID_VALUE = 1281;
snow.platform.web.render.opengl.GL.INVALID_OPERATION = 1282;
snow.platform.web.render.opengl.GL.OUT_OF_MEMORY = 1285;
snow.platform.web.render.opengl.GL.CW = 2304;
snow.platform.web.render.opengl.GL.CCW = 2305;
snow.platform.web.render.opengl.GL.LINE_WIDTH = 2849;
snow.platform.web.render.opengl.GL.ALIASED_POINT_SIZE_RANGE = 33901;
snow.platform.web.render.opengl.GL.ALIASED_LINE_WIDTH_RANGE = 33902;
snow.platform.web.render.opengl.GL.CULL_FACE_MODE = 2885;
snow.platform.web.render.opengl.GL.FRONT_FACE = 2886;
snow.platform.web.render.opengl.GL.DEPTH_RANGE = 2928;
snow.platform.web.render.opengl.GL.DEPTH_WRITEMASK = 2930;
snow.platform.web.render.opengl.GL.DEPTH_CLEAR_VALUE = 2931;
snow.platform.web.render.opengl.GL.DEPTH_FUNC = 2932;
snow.platform.web.render.opengl.GL.STENCIL_CLEAR_VALUE = 2961;
snow.platform.web.render.opengl.GL.STENCIL_FUNC = 2962;
snow.platform.web.render.opengl.GL.STENCIL_FAIL = 2964;
snow.platform.web.render.opengl.GL.STENCIL_PASS_DEPTH_FAIL = 2965;
snow.platform.web.render.opengl.GL.STENCIL_PASS_DEPTH_PASS = 2966;
snow.platform.web.render.opengl.GL.STENCIL_REF = 2967;
snow.platform.web.render.opengl.GL.STENCIL_VALUE_MASK = 2963;
snow.platform.web.render.opengl.GL.STENCIL_WRITEMASK = 2968;
snow.platform.web.render.opengl.GL.STENCIL_BACK_FUNC = 34816;
snow.platform.web.render.opengl.GL.STENCIL_BACK_FAIL = 34817;
snow.platform.web.render.opengl.GL.STENCIL_BACK_PASS_DEPTH_FAIL = 34818;
snow.platform.web.render.opengl.GL.STENCIL_BACK_PASS_DEPTH_PASS = 34819;
snow.platform.web.render.opengl.GL.STENCIL_BACK_REF = 36003;
snow.platform.web.render.opengl.GL.STENCIL_BACK_VALUE_MASK = 36004;
snow.platform.web.render.opengl.GL.STENCIL_BACK_WRITEMASK = 36005;
snow.platform.web.render.opengl.GL.VIEWPORT = 2978;
snow.platform.web.render.opengl.GL.SCISSOR_BOX = 3088;
snow.platform.web.render.opengl.GL.COLOR_CLEAR_VALUE = 3106;
snow.platform.web.render.opengl.GL.COLOR_WRITEMASK = 3107;
snow.platform.web.render.opengl.GL.UNPACK_ALIGNMENT = 3317;
snow.platform.web.render.opengl.GL.PACK_ALIGNMENT = 3333;
snow.platform.web.render.opengl.GL.MAX_TEXTURE_SIZE = 3379;
snow.platform.web.render.opengl.GL.MAX_VIEWPORT_DIMS = 3386;
snow.platform.web.render.opengl.GL.SUBPIXEL_BITS = 3408;
snow.platform.web.render.opengl.GL.RED_BITS = 3410;
snow.platform.web.render.opengl.GL.GREEN_BITS = 3411;
snow.platform.web.render.opengl.GL.BLUE_BITS = 3412;
snow.platform.web.render.opengl.GL.ALPHA_BITS = 3413;
snow.platform.web.render.opengl.GL.DEPTH_BITS = 3414;
snow.platform.web.render.opengl.GL.STENCIL_BITS = 3415;
snow.platform.web.render.opengl.GL.POLYGON_OFFSET_UNITS = 10752;
snow.platform.web.render.opengl.GL.POLYGON_OFFSET_FACTOR = 32824;
snow.platform.web.render.opengl.GL.TEXTURE_BINDING_2D = 32873;
snow.platform.web.render.opengl.GL.SAMPLE_BUFFERS = 32936;
snow.platform.web.render.opengl.GL.SAMPLES = 32937;
snow.platform.web.render.opengl.GL.SAMPLE_COVERAGE_VALUE = 32938;
snow.platform.web.render.opengl.GL.SAMPLE_COVERAGE_INVERT = 32939;
snow.platform.web.render.opengl.GL.COMPRESSED_TEXTURE_FORMATS = 34467;
snow.platform.web.render.opengl.GL.DONT_CARE = 4352;
snow.platform.web.render.opengl.GL.FASTEST = 4353;
snow.platform.web.render.opengl.GL.NICEST = 4354;
snow.platform.web.render.opengl.GL.GENERATE_MIPMAP_HINT = 33170;
snow.platform.web.render.opengl.GL.BYTE = 5120;
snow.platform.web.render.opengl.GL.UNSIGNED_BYTE = 5121;
snow.platform.web.render.opengl.GL.SHORT = 5122;
snow.platform.web.render.opengl.GL.UNSIGNED_SHORT = 5123;
snow.platform.web.render.opengl.GL.INT = 5124;
snow.platform.web.render.opengl.GL.UNSIGNED_INT = 5125;
snow.platform.web.render.opengl.GL.FLOAT = 5126;
snow.platform.web.render.opengl.GL.DEPTH_COMPONENT = 6402;
snow.platform.web.render.opengl.GL.ALPHA = 6406;
snow.platform.web.render.opengl.GL.RGB = 6407;
snow.platform.web.render.opengl.GL.RGBA = 6408;
snow.platform.web.render.opengl.GL.LUMINANCE = 6409;
snow.platform.web.render.opengl.GL.LUMINANCE_ALPHA = 6410;
snow.platform.web.render.opengl.GL.UNSIGNED_SHORT_4_4_4_4 = 32819;
snow.platform.web.render.opengl.GL.UNSIGNED_SHORT_5_5_5_1 = 32820;
snow.platform.web.render.opengl.GL.UNSIGNED_SHORT_5_6_5 = 33635;
snow.platform.web.render.opengl.GL.FRAGMENT_SHADER = 35632;
snow.platform.web.render.opengl.GL.VERTEX_SHADER = 35633;
snow.platform.web.render.opengl.GL.MAX_VERTEX_ATTRIBS = 34921;
snow.platform.web.render.opengl.GL.MAX_VERTEX_UNIFORM_VECTORS = 36347;
snow.platform.web.render.opengl.GL.MAX_VARYING_VECTORS = 36348;
snow.platform.web.render.opengl.GL.MAX_COMBINED_TEXTURE_IMAGE_UNITS = 35661;
snow.platform.web.render.opengl.GL.MAX_VERTEX_TEXTURE_IMAGE_UNITS = 35660;
snow.platform.web.render.opengl.GL.MAX_TEXTURE_IMAGE_UNITS = 34930;
snow.platform.web.render.opengl.GL.MAX_FRAGMENT_UNIFORM_VECTORS = 36349;
snow.platform.web.render.opengl.GL.SHADER_TYPE = 35663;
snow.platform.web.render.opengl.GL.DELETE_STATUS = 35712;
snow.platform.web.render.opengl.GL.LINK_STATUS = 35714;
snow.platform.web.render.opengl.GL.VALIDATE_STATUS = 35715;
snow.platform.web.render.opengl.GL.ATTACHED_SHADERS = 35717;
snow.platform.web.render.opengl.GL.ACTIVE_UNIFORMS = 35718;
snow.platform.web.render.opengl.GL.ACTIVE_ATTRIBUTES = 35721;
snow.platform.web.render.opengl.GL.SHADING_LANGUAGE_VERSION = 35724;
snow.platform.web.render.opengl.GL.CURRENT_PROGRAM = 35725;
snow.platform.web.render.opengl.GL.NEVER = 512;
snow.platform.web.render.opengl.GL.LESS = 513;
snow.platform.web.render.opengl.GL.EQUAL = 514;
snow.platform.web.render.opengl.GL.LEQUAL = 515;
snow.platform.web.render.opengl.GL.GREATER = 516;
snow.platform.web.render.opengl.GL.NOTEQUAL = 517;
snow.platform.web.render.opengl.GL.GEQUAL = 518;
snow.platform.web.render.opengl.GL.ALWAYS = 519;
snow.platform.web.render.opengl.GL.KEEP = 7680;
snow.platform.web.render.opengl.GL.REPLACE = 7681;
snow.platform.web.render.opengl.GL.INCR = 7682;
snow.platform.web.render.opengl.GL.DECR = 7683;
snow.platform.web.render.opengl.GL.INVERT = 5386;
snow.platform.web.render.opengl.GL.INCR_WRAP = 34055;
snow.platform.web.render.opengl.GL.DECR_WRAP = 34056;
snow.platform.web.render.opengl.GL.VENDOR = 7936;
snow.platform.web.render.opengl.GL.RENDERER = 7937;
snow.platform.web.render.opengl.GL.VERSION = 7938;
snow.platform.web.render.opengl.GL.NEAREST = 9728;
snow.platform.web.render.opengl.GL.LINEAR = 9729;
snow.platform.web.render.opengl.GL.NEAREST_MIPMAP_NEAREST = 9984;
snow.platform.web.render.opengl.GL.LINEAR_MIPMAP_NEAREST = 9985;
snow.platform.web.render.opengl.GL.NEAREST_MIPMAP_LINEAR = 9986;
snow.platform.web.render.opengl.GL.LINEAR_MIPMAP_LINEAR = 9987;
snow.platform.web.render.opengl.GL.TEXTURE_MAG_FILTER = 10240;
snow.platform.web.render.opengl.GL.TEXTURE_MIN_FILTER = 10241;
snow.platform.web.render.opengl.GL.TEXTURE_WRAP_S = 10242;
snow.platform.web.render.opengl.GL.TEXTURE_WRAP_T = 10243;
snow.platform.web.render.opengl.GL.TEXTURE_2D = 3553;
snow.platform.web.render.opengl.GL.TEXTURE = 5890;
snow.platform.web.render.opengl.GL.TEXTURE_CUBE_MAP = 34067;
snow.platform.web.render.opengl.GL.TEXTURE_BINDING_CUBE_MAP = 34068;
snow.platform.web.render.opengl.GL.TEXTURE_CUBE_MAP_POSITIVE_X = 34069;
snow.platform.web.render.opengl.GL.TEXTURE_CUBE_MAP_NEGATIVE_X = 34070;
snow.platform.web.render.opengl.GL.TEXTURE_CUBE_MAP_POSITIVE_Y = 34071;
snow.platform.web.render.opengl.GL.TEXTURE_CUBE_MAP_NEGATIVE_Y = 34072;
snow.platform.web.render.opengl.GL.TEXTURE_CUBE_MAP_POSITIVE_Z = 34073;
snow.platform.web.render.opengl.GL.TEXTURE_CUBE_MAP_NEGATIVE_Z = 34074;
snow.platform.web.render.opengl.GL.MAX_CUBE_MAP_TEXTURE_SIZE = 34076;
snow.platform.web.render.opengl.GL.TEXTURE0 = 33984;
snow.platform.web.render.opengl.GL.TEXTURE1 = 33985;
snow.platform.web.render.opengl.GL.TEXTURE2 = 33986;
snow.platform.web.render.opengl.GL.TEXTURE3 = 33987;
snow.platform.web.render.opengl.GL.TEXTURE4 = 33988;
snow.platform.web.render.opengl.GL.TEXTURE5 = 33989;
snow.platform.web.render.opengl.GL.TEXTURE6 = 33990;
snow.platform.web.render.opengl.GL.TEXTURE7 = 33991;
snow.platform.web.render.opengl.GL.TEXTURE8 = 33992;
snow.platform.web.render.opengl.GL.TEXTURE9 = 33993;
snow.platform.web.render.opengl.GL.TEXTURE10 = 33994;
snow.platform.web.render.opengl.GL.TEXTURE11 = 33995;
snow.platform.web.render.opengl.GL.TEXTURE12 = 33996;
snow.platform.web.render.opengl.GL.TEXTURE13 = 33997;
snow.platform.web.render.opengl.GL.TEXTURE14 = 33998;
snow.platform.web.render.opengl.GL.TEXTURE15 = 33999;
snow.platform.web.render.opengl.GL.TEXTURE16 = 34000;
snow.platform.web.render.opengl.GL.TEXTURE17 = 34001;
snow.platform.web.render.opengl.GL.TEXTURE18 = 34002;
snow.platform.web.render.opengl.GL.TEXTURE19 = 34003;
snow.platform.web.render.opengl.GL.TEXTURE20 = 34004;
snow.platform.web.render.opengl.GL.TEXTURE21 = 34005;
snow.platform.web.render.opengl.GL.TEXTURE22 = 34006;
snow.platform.web.render.opengl.GL.TEXTURE23 = 34007;
snow.platform.web.render.opengl.GL.TEXTURE24 = 34008;
snow.platform.web.render.opengl.GL.TEXTURE25 = 34009;
snow.platform.web.render.opengl.GL.TEXTURE26 = 34010;
snow.platform.web.render.opengl.GL.TEXTURE27 = 34011;
snow.platform.web.render.opengl.GL.TEXTURE28 = 34012;
snow.platform.web.render.opengl.GL.TEXTURE29 = 34013;
snow.platform.web.render.opengl.GL.TEXTURE30 = 34014;
snow.platform.web.render.opengl.GL.TEXTURE31 = 34015;
snow.platform.web.render.opengl.GL.ACTIVE_TEXTURE = 34016;
snow.platform.web.render.opengl.GL.REPEAT = 10497;
snow.platform.web.render.opengl.GL.CLAMP_TO_EDGE = 33071;
snow.platform.web.render.opengl.GL.MIRRORED_REPEAT = 33648;
snow.platform.web.render.opengl.GL.FLOAT_VEC2 = 35664;
snow.platform.web.render.opengl.GL.FLOAT_VEC3 = 35665;
snow.platform.web.render.opengl.GL.FLOAT_VEC4 = 35666;
snow.platform.web.render.opengl.GL.INT_VEC2 = 35667;
snow.platform.web.render.opengl.GL.INT_VEC3 = 35668;
snow.platform.web.render.opengl.GL.INT_VEC4 = 35669;
snow.platform.web.render.opengl.GL.BOOL = 35670;
snow.platform.web.render.opengl.GL.BOOL_VEC2 = 35671;
snow.platform.web.render.opengl.GL.BOOL_VEC3 = 35672;
snow.platform.web.render.opengl.GL.BOOL_VEC4 = 35673;
snow.platform.web.render.opengl.GL.FLOAT_MAT2 = 35674;
snow.platform.web.render.opengl.GL.FLOAT_MAT3 = 35675;
snow.platform.web.render.opengl.GL.FLOAT_MAT4 = 35676;
snow.platform.web.render.opengl.GL.SAMPLER_2D = 35678;
snow.platform.web.render.opengl.GL.SAMPLER_CUBE = 35680;
snow.platform.web.render.opengl.GL.VERTEX_ATTRIB_ARRAY_ENABLED = 34338;
snow.platform.web.render.opengl.GL.VERTEX_ATTRIB_ARRAY_SIZE = 34339;
snow.platform.web.render.opengl.GL.VERTEX_ATTRIB_ARRAY_STRIDE = 34340;
snow.platform.web.render.opengl.GL.VERTEX_ATTRIB_ARRAY_TYPE = 34341;
snow.platform.web.render.opengl.GL.VERTEX_ATTRIB_ARRAY_NORMALIZED = 34922;
snow.platform.web.render.opengl.GL.VERTEX_ATTRIB_ARRAY_POINTER = 34373;
snow.platform.web.render.opengl.GL.VERTEX_ATTRIB_ARRAY_BUFFER_BINDING = 34975;
snow.platform.web.render.opengl.GL.VERTEX_PROGRAM_POINT_SIZE = 34370;
snow.platform.web.render.opengl.GL.POINT_SPRITE = 34913;
snow.platform.web.render.opengl.GL.COMPILE_STATUS = 35713;
snow.platform.web.render.opengl.GL.LOW_FLOAT = 36336;
snow.platform.web.render.opengl.GL.MEDIUM_FLOAT = 36337;
snow.platform.web.render.opengl.GL.HIGH_FLOAT = 36338;
snow.platform.web.render.opengl.GL.LOW_INT = 36339;
snow.platform.web.render.opengl.GL.MEDIUM_INT = 36340;
snow.platform.web.render.opengl.GL.HIGH_INT = 36341;
snow.platform.web.render.opengl.GL.FRAMEBUFFER = 36160;
snow.platform.web.render.opengl.GL.RENDERBUFFER = 36161;
snow.platform.web.render.opengl.GL.RGBA4 = 32854;
snow.platform.web.render.opengl.GL.RGB5_A1 = 32855;
snow.platform.web.render.opengl.GL.RGB565 = 36194;
snow.platform.web.render.opengl.GL.DEPTH_COMPONENT16 = 33189;
snow.platform.web.render.opengl.GL.STENCIL_INDEX = 6401;
snow.platform.web.render.opengl.GL.STENCIL_INDEX8 = 36168;
snow.platform.web.render.opengl.GL.DEPTH_STENCIL = 34041;
snow.platform.web.render.opengl.GL.RENDERBUFFER_WIDTH = 36162;
snow.platform.web.render.opengl.GL.RENDERBUFFER_HEIGHT = 36163;
snow.platform.web.render.opengl.GL.RENDERBUFFER_INTERNAL_FORMAT = 36164;
snow.platform.web.render.opengl.GL.RENDERBUFFER_RED_SIZE = 36176;
snow.platform.web.render.opengl.GL.RENDERBUFFER_GREEN_SIZE = 36177;
snow.platform.web.render.opengl.GL.RENDERBUFFER_BLUE_SIZE = 36178;
snow.platform.web.render.opengl.GL.RENDERBUFFER_ALPHA_SIZE = 36179;
snow.platform.web.render.opengl.GL.RENDERBUFFER_DEPTH_SIZE = 36180;
snow.platform.web.render.opengl.GL.RENDERBUFFER_STENCIL_SIZE = 36181;
snow.platform.web.render.opengl.GL.FRAMEBUFFER_ATTACHMENT_OBJECT_TYPE = 36048;
snow.platform.web.render.opengl.GL.FRAMEBUFFER_ATTACHMENT_OBJECT_NAME = 36049;
snow.platform.web.render.opengl.GL.FRAMEBUFFER_ATTACHMENT_TEXTURE_LEVEL = 36050;
snow.platform.web.render.opengl.GL.FRAMEBUFFER_ATTACHMENT_TEXTURE_CUBE_MAP_FACE = 36051;
snow.platform.web.render.opengl.GL.COLOR_ATTACHMENT0 = 36064;
snow.platform.web.render.opengl.GL.DEPTH_ATTACHMENT = 36096;
snow.platform.web.render.opengl.GL.STENCIL_ATTACHMENT = 36128;
snow.platform.web.render.opengl.GL.DEPTH_STENCIL_ATTACHMENT = 33306;
snow.platform.web.render.opengl.GL.NONE = 0;
snow.platform.web.render.opengl.GL.FRAMEBUFFER_COMPLETE = 36053;
snow.platform.web.render.opengl.GL.FRAMEBUFFER_INCOMPLETE_ATTACHMENT = 36054;
snow.platform.web.render.opengl.GL.FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT = 36055;
snow.platform.web.render.opengl.GL.FRAMEBUFFER_INCOMPLETE_DIMENSIONS = 36057;
snow.platform.web.render.opengl.GL.FRAMEBUFFER_UNSUPPORTED = 36061;
snow.platform.web.render.opengl.GL.FRAMEBUFFER_BINDING = 36006;
snow.platform.web.render.opengl.GL.RENDERBUFFER_BINDING = 36007;
snow.platform.web.render.opengl.GL.MAX_RENDERBUFFER_SIZE = 34024;
snow.platform.web.render.opengl.GL.INVALID_FRAMEBUFFER_OPERATION = 1286;
snow.platform.web.render.opengl.GL.UNPACK_FLIP_Y_WEBGL = 37440;
snow.platform.web.render.opengl.GL.UNPACK_PREMULTIPLY_ALPHA_WEBGL = 37441;
snow.platform.web.render.opengl.GL.CONTEXT_LOST_WEBGL = 37442;
snow.platform.web.render.opengl.GL.UNPACK_COLORSPACE_CONVERSION_WEBGL = 37443;
snow.platform.web.render.opengl.GL.BROWSER_DEFAULT_WEBGL = 37444;
snow.platform.web.utils.ByteArray.BIG_ENDIAN = "bigEndian";
snow.platform.web.utils.ByteArray.LITTLE_ENDIAN = "littleEndian";
snow.types._Types.AssetType_Impl_.bytes = 0;
snow.types._Types.AssetType_Impl_.text = 1;
snow.types._Types.AssetType_Impl_.image = 2;
snow.types._Types.AssetType_Impl_.audio = 3;
snow.types._Types.AudioFormatType_Impl_.unknown = 0;
snow.types._Types.AudioFormatType_Impl_.ogg = 1;
snow.types._Types.AudioFormatType_Impl_.wav = 2;
snow.types._Types.AudioFormatType_Impl_.pcm = 3;
snow.types._Types.OpenGLProfile_Impl_.compatibility = 0;
snow.types._Types.OpenGLProfile_Impl_.core = 1;
snow.types._Types.TextEventType_Impl_.unknown = 0;
snow.types._Types.TextEventType_Impl_.edit = 1;
snow.types._Types.TextEventType_Impl_.input = 2;
snow.types._Types.GamepadDeviceEventType_Impl_.unknown = 0;
snow.types._Types.GamepadDeviceEventType_Impl_.device_added = 1;
snow.types._Types.GamepadDeviceEventType_Impl_.device_removed = 2;
snow.types._Types.GamepadDeviceEventType_Impl_.device_remapped = 3;
snow.types._Types.SystemEventType_Impl_.unknown = 0;
snow.types._Types.SystemEventType_Impl_.init = 1;
snow.types._Types.SystemEventType_Impl_.ready = 2;
snow.types._Types.SystemEventType_Impl_.update = 3;
snow.types._Types.SystemEventType_Impl_.shutdown = 4;
snow.types._Types.SystemEventType_Impl_.window = 5;
snow.types._Types.SystemEventType_Impl_.input = 6;
snow.types._Types.SystemEventType_Impl_.quit = 7;
snow.types._Types.SystemEventType_Impl_.app_terminating = 8;
snow.types._Types.SystemEventType_Impl_.app_lowmemory = 9;
snow.types._Types.SystemEventType_Impl_.app_willenterbackground = 10;
snow.types._Types.SystemEventType_Impl_.app_didenterbackground = 11;
snow.types._Types.SystemEventType_Impl_.app_willenterforeground = 12;
snow.types._Types.SystemEventType_Impl_.app_didenterforeground = 13;
snow.types._Types.SystemEventType_Impl_.file = 14;
snow.types._Types.WindowEventType_Impl_.unknown = 0;
snow.types._Types.WindowEventType_Impl_.created = 1;
snow.types._Types.WindowEventType_Impl_.shown = 2;
snow.types._Types.WindowEventType_Impl_.hidden = 3;
snow.types._Types.WindowEventType_Impl_.exposed = 4;
snow.types._Types.WindowEventType_Impl_.moved = 5;
snow.types._Types.WindowEventType_Impl_.resized = 6;
snow.types._Types.WindowEventType_Impl_.size_changed = 7;
snow.types._Types.WindowEventType_Impl_.minimized = 8;
snow.types._Types.WindowEventType_Impl_.maximized = 9;
snow.types._Types.WindowEventType_Impl_.restored = 10;
snow.types._Types.WindowEventType_Impl_.enter = 11;
snow.types._Types.WindowEventType_Impl_.leave = 12;
snow.types._Types.WindowEventType_Impl_.focus_gained = 13;
snow.types._Types.WindowEventType_Impl_.focus_lost = 14;
snow.types._Types.WindowEventType_Impl_.close = 15;
snow.types._Types.WindowEventType_Impl_.destroy = 16;
snow.types._Types.InputEventType_Impl_.unknown = 0;
snow.types._Types.InputEventType_Impl_.key = 1;
snow.types._Types.InputEventType_Impl_.mouse = 2;
snow.types._Types.InputEventType_Impl_.touch = 3;
snow.types._Types.InputEventType_Impl_.joystick = 4;
snow.types._Types.InputEventType_Impl_.controller = 5;
snow.types._Types.FileEventType_Impl_.unknown = 0;
snow.types._Types.FileEventType_Impl_.modify = 1;
snow.types._Types.FileEventType_Impl_.remove = 2;
snow.types._Types.FileEventType_Impl_.create = 3;
snow.types._Types.FileEventType_Impl_.drop = 4;
snow.utils.Timer.running_timers = [];
snow.utils.format.tools._InflateImpl.Window.SIZE = 32768;
snow.utils.format.tools._InflateImpl.Window.BUFSIZE = 65536;
snow.utils.format.tools.InflateImpl.LEN_EXTRA_BITS_TBL = [0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0,-1,-1];
snow.utils.format.tools.InflateImpl.LEN_BASE_VAL_TBL = [3,4,5,6,7,8,9,10,11,13,15,17,19,23,27,31,35,43,51,59,67,83,99,115,131,163,195,227,258];
snow.utils.format.tools.InflateImpl.DIST_EXTRA_BITS_TBL = [0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13,-1,-1];
snow.utils.format.tools.InflateImpl.DIST_BASE_VAL_TBL = [1,2,3,4,5,7,9,13,17,25,33,49,65,97,129,193,257,385,513,769,1025,1537,2049,3073,4097,6145,8193,12289,16385,24577];
snow.utils.format.tools.InflateImpl.CODE_LENGTHS_POS = [16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15];
SnowApp.main();
})();
