app.controller('imgSelectCtrl', function ($scope, mBaasService) {
    $scope.showCamera = function () {
        var options = {
            quality: 70,
            destinationType: Camera.DestinationType.DATA_URL,
            sourceType: Camera.PictureSourceType.CAMERA,
            saveToPhotoAlbum: true,
            correntOrientation: false,
            encodingType: Camera.EncodingType.JPEG,
            cameraDirection: Camera.Direction.BACK
        }

        getPicture(options);
    }

    $scope.showGallery = function () {
        var options = {
            quality: 70,
            destinationType: Camera.DestinationType.DATA_URL,
            sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
            encodingType: Camera.EncodingType.JPEG
        }

        getPicture(options);
    }

    // ギャラリーorカメラから画像を投稿フォームに表示する。
    function getPicture(options) {

        var onSuccess = function (imageURI) {
            //            var blob = toBlob(imageURI);
            //            var ncmb = mBaasService.getNcmb();
            //            ncmb.File.upload(Date.now() + '.jpg', blob).then(
            //                function (data) {
            //                    console.log('できたー');
            //                    myNavigator.pushPage('post.html', {
            //                        image: data.uri
            //                    });
            //                }
            //            ).catch(function (err) {
            //                console.error(err);
            //            });
            myNavigator.pushPage('post.html', {
                image: "data:image/jpeg;base64," + imageURI
            });
        }

        var onFail = function () {
            console.error('画像の取得失敗');
        }

        navigator.camera.getPicture(function (imageURI) {
            onSuccess(imageURI);
        }, onFail, options);
    }

});

app.controller('postCtrl', function ($scope) {
    // 画像縮小処理
    $scope.init = function () {
        var image = new Image();
        image.onload = function(e) {
            $scope.$apply(function() {
                var imgWidth = image.naturalWidth;
                var imgHeight = image.naturalHeight;
                var rate = 0;
                if (imgWidth >= imgHeight) {
                    rate = 320 / imgWidth;
                } else {
                    rate = 320 / imgHeight;
                }

                EXIF.getData(image, function() {
                    var canvas = document.createElement('canvas');
                    var drawWidth = imgWidth * rate;
                    var drawHeight = imgHeight * rate;
                    canvas.width = drawWidth;
                    canvas.height = drawHeight;
                    var ctx = canvas.getContext('2d');
                    var orientation = EXIF.getTag(image, "Orientation");
                    console.log(orientation);
                    var angles = {'3':180, '6':90, '8': 270};
                    ctx.translate(drawWidth / 2, drawHeight / 2);
                    ctx.rotate((angles[orientation] * Math.PI) / 180);
                    ctx.translate(-drawWidth / 2, -drawHeight / 2);
                    ctx.drawImage(image, 0, 0, imgWidth, imgHeight, 0, 0, drawWidth, drawHeight);
                    $scope.imageURI = canvas.toDataURL();
                });

            })
        }
        
        var options = $scope.myNavigator.getCurrentPage().options;
        image.src = options.image;
    }

    $scope.resize = function() {
    }
    $scope.upload = function () {
        var img = document.getElementById('upload_img');
        alert(img.width);
    }
});

app.directive('imgOnload', ['$parse', function ($parse) {
    return {
      link: function(scope, element, attrs) {
        element.bind("load" , function(e) {
          var func = $parse(attrs.imgOnload);
          func(scope);
        });
      }
    }
  }]);

// base64形式の画像データをBlobオブジェクトに変換する。
function toBlob(canvas) {
    if (canvas && canvas.getContext) {
        var imageType = 'image/jpg';
        var base64 = canvas.toDataURL(imageType);
        var bin = atob(base64.replace(/^.*,/, ''));
        var buffer = new Uint8Array(bin.length);
        for (var i = 0; i < bin.length; i++) {
            buffer[i] = bin.charCodeAt(i);
        }

        return new Blob([buffer.buffer], {
            type: imageType});
    }
    return null;
}

function b64ToBlob(base64) {
    var bin = atob(base64.replace(/^.*,/, ''));
    var buffer = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) {
        buffer[i] = bin.charCodeAt(i);
    }
    // Blobを作成
    try{
        var blob = new Blob([buffer.buffer], {
            type: 'image/jpg'
        });
    }catch (e){
        return false;
    }
    return blob;
}