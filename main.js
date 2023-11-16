

// classList.removeの時の確認


import './style.css'
import * as THREE from "three" 

//①canvas
const canvas = document.querySelector("#webgl");

//②シーン
const scene =  new THREE.Scene();


//③背景のテクスチャ(シーン以降に記述)
const textureLoader = new THREE.TextureLoader
const bdTexture = textureLoader.load("bg/bg.jpg");
scene.background = bdTexture;



// Raycaster の作成
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

//床の追加
const meshFloor = new THREE.Mesh(
    new THREE.BoxGeometry(2000,0.1,2000),
    new THREE.MeshStandardMaterial()
);

meshFloor.position.set(0,0,-25);

// 影を受け付ける
meshFloor.receiveShadow = true;
scene.add(meshFloor)


//④サイズ(アスペクト比)
const sizes = {
    width: innerWidth,
    height: innerHeight,
};

//⑤カメラ
const camera  = new THREE.PerspectiveCamera(
    //引数4つ (視野角、アスペクト比(幅、高さ)、ニアー、ファー)
    75,
    sizes.width / sizes.height,
    0.1,
    1000
);

//⑥レンダラー(webglrendererはcanvasの中に描画していく)
const renderer = new THREE.WebGLRenderer({
    canvas: canvas, //canvasのオブジェクトをcanvasという引数にぶち込む
});
renderer.setSize(sizes.width, sizes.height); //レンダラーのサイズ指定(ブラウザの画面いっぱい)
renderer.setPixelRatio(window.devicePixelRatio);    //webglで備え付けられてる関数→モデルのpixelの最適化
renderer.shadowMap.enabled = true; //レンダラー：影の有効化

//------canvas、シーン、サイズ、カメラ、レンダラーが基本的なひな形-----------------------------


//⑦オブジェクトの作成(作成したモデルを使うにはgltfモジュールをつかう)
const boxGeometry = new THREE.ConeGeometry(5,5,3,4);    //box(正方形)型の追加
const boxMaterial = new THREE.MeshStandardMaterial();
const box = new THREE.Mesh(boxGeometry,boxMaterial);
//影を落とす
boxGeometry.castShadow = true;

box.position.set(0,10,0);    //boxの座標をマイナス方向に持っていく

//座標の指定をしていないとboxとカメラの座標位置がかぶっているからオブジェクトが見えない→(webglにおけるｘ、ｙ、ｚ座標のつかみが必要)






const torusGeometry = new THREE.TorusGeometry(8, 2, 16, 80);   //ドーナツ型の追加
const torusMaterial = new THREE.MeshStandardMaterial({ color:0xfff8f8 });
const torus = new THREE.Mesh(torusGeometry,torusMaterial);

const torusGeometry2 = new THREE.TorusGeometry(8, 2, 16, 80);   //ドーナツ型の追加
const torusMaterial2 = new THREE.MeshStandardMaterial({ color: 0xc4e4ff});
const torus2 = new THREE.Mesh(torusGeometry2,torusMaterial2);


//影を落とす
torusGeometry.castShadow = true;

torus.position.set(0, 10, 25);
torus2.position.set(0, 10, -25);


//  平行光源
 const directionalLight = new THREE.DirectionalLight(0xffffff);
 directionalLight.position.set(1, 1, 1);
 scene.add(directionalLight);

// ポイント光源
//  const pointLight = new THREE.PointLight(0x00ffff, 2, 1000);
//  scene.add(pointLight);

//影を落とす光源のライトの追加
const light = new THREE.SpotLight(0xffffff, 2, 100, Math.PI / 4, 1);
      // ライトに影を有効にする
      light.castShadow = true;
      light.shadow.mapSize.width = 2048;
      light.shadow.mapSize.height = 2048;
      scene.add(light);

      const lightHelper = new THREE.PointLightHelper(light);
      scene.add(lightHelper);


scene.add(box,torus,torus2);   


//⑧線形補間で滑らかに移動させる  線形補間には公式がありまーす→動画114
//------------------------------------------ここ大事------------------------------------------------------------------
function lerp(x,y,a) {          //移動の滑らかさが一次関数的に変化するもの、二次関数的に変更するものも作れる(今回は一次関数)
    return (1 - a) * x + a * y;
}

//⑨aの値の関数
function scalePercent(start,end){       //scalePercentがaに相当する。a→スクロール率に応じて各区間(start(0)～end(40)のどの位置に存在しているのか割合を取得する)
    return (scrollPercent - start) / (end - start);
}

const section = document.getElementById("section");



//⑩スクロールアニメーション
const animationScripts = [];    //アニメーションの制御について動画110を見ればわかる

animationScripts.push({
    start: 0,
    end: 40,
    
    function(){
        
        camera.lookAt(box.position);
        camera.position.set(0, 10, 10);

    // 照明(スポットライト)の位置を更新
        
    const t = Date.now() / 500;
    const r = 10.0;
    const lx = r * Math.cos(t);
    const lz = r * Math.sin(t);
    const ly = 20.0 + 5.0 * Math.sin(t / 3.0);
    light.position.set(lx, ly, lz);
    }
})


//z軸移動の制御
animationScripts.push({
    start: 40,
    end: 70,
    function() {
        camera.lookAt(box.position);
        camera.position.set(0, 10, 10);  //→z方向の手前位置に動かしておく

        //box.position.z += 0.1;     //線形補間をしてオブジェジュの操作をしていないからスクロール反応ではなく単調に動いているだけになる
        box.position.z = lerp(0,0,scalePercent(40,70)); //lerp(x→始まる座標(position.setで-15にしてるから)、 y→終わる座標、 a→固定値だと物体間の移動ができないから関数を渡してあげる)
        torus.position.z = lerp(10,-30,scalePercent(40,70)); //scalePercent(引数)を渡して⑨のscalePercentのstartとendに当ててる
        torus2.position.z = lerp(-30,30,scalePercent(40,70));
        
        const t = Date.now() / 500;
        const r = 20.0;
        const lx = r * Math.cos(t);
        const lz = r * Math.sin(t);
        const ly = 20.0 + 5.0 * Math.sin(t / 3.0);
        light.position.set(lx, ly, lz);
    },


})

//基本的にanimationScript.pushでスクロール制御ができる

//回転の制御
animationScripts.push({
    start: 70,  //ここの値が配列に入れてるanimationScriptsの動く期間の指定
    end: 80,
    function() {
        camera.lookAt(box.position);
        camera.position.set(0, 10, 10);  //→z方向の手前位置に動かしておく
        //回転の処理　ここも角度の初期値を⑦で指定しているので注意
        box.rotation.z = lerp(1, Math.PI,scalePercent(70,80));   //lerp(回転始まる位置, どこまで回転させるのか,移動位置の座標) *Math.PI→半回転させる

        const t = Date.now() / 500;
        const r = 20.0;
        const lx = r * Math.cos(t);
        const lz = r * Math.sin(t);
        const ly = 20.0 + 5.0 * Math.sin(t / 3.0);
        light.position.set(lx, ly, lz);
    },
})

//カメラの移動
animationScripts.push({
    start: 80,  //ここの値が配列に入れてるanimationScriptsの動く期間の指定
    end: 90,
    //camera.position.set(0, 1, 10);カメラの存在座標(ｘ、ｙ、ｚ)
    function() {
        camera.lookAt(box.position);
        camera.position.x = lerp(0, -15, scalePercent(80, 90));
        camera.position.y = lerp(10, 15, scalePercent(80, 90));
        camera.position.z = lerp(10, 25, scalePercent(80, 90));

        const t = Date.now() / 500;
        const r = 20.0;
        const lx = r * Math.cos(t);
        const lz = r * Math.sin(t);
        const ly = 20.0 + 5.0 * Math.sin(t / 3.0);
        light.position.set(lx, ly, lz);
        
        // console.log("y座標")
        // console.log(camera.position.y);
    },
})



animationScripts.push({
    start: 90,  //ここの値が配列に入れてるanimationScriptsの動く期間の指定
    end: 99,
    //camera.position.set(0, 1, 10);カメラの存在座標(ｘ、ｙ、ｚ)
    function() {



        camera.lookAt(box.position);
        

        //x,yに常に回転をかけ続ける
        box.rotation.x += 0.02;
        box.rotation.y += 0.02;

        const t = Date.now() / 500;
        const r = 20.0;
        const lx = r * Math.cos(t);
        const lz = r * Math.sin(t);
        const ly = 20.0 + 5.0 * Math.sin(t / 3.0);
        light.position.set(lx, ly, lz);

    },    
})

let rot = 0; // 角度
let mouseX = 0; // マウス座標

animationScripts.push({
    start: 99,  //ここの値が配列に入れてるanimationScriptsの動く期間の指定
    end: 101,
    //camera.position.set(0, 1, 10);カメラの存在座標(ｘ、ｙ、ｚ)
    function() {

        // camera.position.x = -15;
        // camera.position.z = 25;
        // camera.position.y = 15
        camera.lookAt(box.position);
        

        //x,yに常に回転をかけ続ける
        box.rotation.x += 0.02;
        box.rotation.y += 0.02;

        const t = Date.now() / 500;
        const r = 20.0;
        const lx = r * Math.cos(t);
        const lz = r * Math.sin(t);
        const ly = 20.0 + 5.0 * Math.sin(t / 3.0);
        light.position.set(lx, ly, lz);

        camera.lookAt(box.position);
        document.addEventListener("mousemove", (event) => {
            mouseX = event.pageX;
          });
        
        
        // マウスの位置に応じて角度を設定
        // マウスのX座標がステージの幅の何%の位置にあるか調べてそれを360度で乗算する
        const targetRot = (mouseX / window.innerWidth) * 360;
        // イージングの公式を用いて滑らかにする
        // 値 += (目標値 - 現在の値) * 減速値
        rot += (targetRot - rot) * 0.02;

        // ラジアンに変換する
        const radian = (rot * Math.PI) / 180;
        // 角度に応じてカメラの位置を設定
        camera.position.x = 29 * Math.sin(radian);
        camera.position.z = 29 * Math.cos(radian);
        
        document.addEventListener('click', onClick);

        function onClick(event) {
            // マウス座標を正規化
            mouse.x = (event.clientX / sizes.width) * 2 - 1;
            mouse.y = -(event.clientY / sizes.height) * 2 + 1;

            // Raycaster でクリックした位置のオブジェクトを取得
            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObjects([torus]);
            const intersects2 = raycaster.intersectObjects([torus2])

            // クリックした場所に torus があればリンク先に飛ぶ
            if (intersects.length > 0) {
                window.location.href = "https://acrobat.adobe.com/id/urn:aaid:sc:AP:063d967c-7b3b-4c4d-bc0c-bb2eb299b896";
            }
            if (intersects2.length > 0) {
                window.location.href = "https://acrobat.adobe.com/id/urn:aaid:sc:AP:37555371-836f-4673-8ccf-e4c88fb6a4b4";
            }
}
        
        
        
        

    },    
})




//↑ここまでだとanimationScriptという配列にアニメーションを追加しただけで実行できてない

//⑪アニメーションを開始
function playScrollAnimation() {
    animationScripts.forEach((animation) => {   //forEachで配列の中身をanimationとして取り出す
    
    //PlayScrollAnimationは自動的に実行されるものなのでどこからどこまでboxを動かすのか、スクロール率に応じてboxの制御をしないといけない(スクロール率の取得へ)
    //animation.function();だけではスクロールに対応したオブジェクトの操作は出来ない
                                                
    if(scrollPercent>= animation.start && scrollPercent <= animation.end)
        animation.function();

    });      
    
}   //playScrollAnimationをtickのなかに入れればOK


//⑫ブラウザのスクロール率を取得  (x/y-l) * 100
//-----------------------------ここ応用きかせやすいかも-----------------------------

let scrollPercent = 0; //変数の用意→スクロール率の取得

let scrollPercent2 = 0;

document.body.onscroll = () => {
    scrollPercent = 
        (document.documentElement.scrollTop / 
           (document.documentElement.scrollHeight - 
                document.documentElement.clientHeight)) * 
        100;


        console.log(scrollPercent);
   
    }


//⑬アニメーション
const tick = () => {        //アロー関数（定数/変数名 =（引数）=> {処理}; 　定数/変数名 = function() {処理};と一緒
    window.requestAnimationFrame(tick);     //tickを何回もフレーム単位で呼び出す
    playScrollAnimation();
    renderer.render(scene, camera);

    //マウスの角度に応じて角度設定
};

tick();

//⑭ブラウザのリサイズ操作(サイト、カメラのアスペクト比、レンダラーのリサイズ)
window.addEventListener("resize", () =>{        //addEventListener　マウスによるクリック、キーボードからの入力といった様々なイベント処理を実行するメソッド　
    //サイトのリサイズ
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;

    //カメラのアスペクト比のリサイズ
    camera.aspect = sizes.width /sizes.height;
    //アスペクト比を変えると下の関数(updateProjectionMatrix)を呼ぶ
    camera.updateProjectionMatrix();

    //レンダラーのリサイズ
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(window.devicePixelRatio);

})



//loading画面の作成


//下のコードの効率化
function loaded() {
    document.getElementById("loading").classList.add("active");
    document.body.style.overflow = 'auto';
    document.body.style.display = 'block';
}


setTimeout(loaded, 5000)




// window.addEventListener("load", function() {            //loadで指定することで画面の要素全てを読み込んだ後にaddeventlisnnerを起動させる
//     setTimeout(function(){
//         document.getElementById("loading").classList.remove("active");
//     },5000)  //500→0.5秒
//     //クッソ重いサイトの読み込みとかだとloadingが一生終わらんとかある
// })

//addeventlisnnerの処理待ちをなくしたsettimeoutを準備しておく
// setTimeout(function(){
//     document.getElementById("loading").classList.remove("active");
// },100000)
