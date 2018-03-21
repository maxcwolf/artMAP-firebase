angular.module('app')

    .controller("CameraCtrl2", function ($scope, $cordovaCamera, $cordovaFile, $cordovaGeolocation, FileService, CameraFactory, $ionicLoading) {

         //allow the map to be shown when changing back to the map state
         $scope.showMap = true

        let b64data= ""

        //create scoped object for any text fields on picture
        $scope.picInput = {
            "artist": "",
            "name": ""
        }

        let lat = ""
        let long = ""
        let time = ""

        // //// MORE COMPLEX VERSION OF TAKE PHOT
        // //// copies the file to the cordova.file.dataDirectory
        $scope.srcImage = "";
        $scope.takePhoto = function () {

            const picOptions = {
                quality: 50,
                destinationType: Camera.DestinationType.DATA_URL,
                sourceType: Camera.PictureSourceType.CAMERA,
                allowEdit: true,
                encodingType: Camera.EncodingType.JPEG,
                targetWidth: 350,
                targetHeight: 400,
                popoverOptions: CameraPopoverOptions,
                saveToPhotoAlbum: false,
                correctOrientation: true
            };

            $cordovaCamera
                .getPicture(picOptions)
                .then(function (imageData) {
                    $scope.srcImage = "data:image/jpeg;base64," + imageData;
                    b64data = imageData;
            })

            const geoOptions = {
                enableHighAccuracy: true
            }

            $cordovaGeolocation
                .getCurrentPosition(geoOptions)
                .then(function (position) {
                    console.log(JSON.stringify(position))
                    lat = position.coords.latitude
                    long = position.coords.longitude
                    time = position.timestamp
            })





        }


        //TRY TO CONVERT URL TO BLOB URL
        function fetchLocalFileViaCordova(path, successCallback, errorCallback) {
            console.log("path is...", path)

            window.resolveLocalFileSystemURL(path, function (entry) {
                console.log("entry is ...", JSON.stringify(entry))
                entry.file(successCallback, errorCallback);
            }, errorCallback);
        };

        function fetchLocalFileViaCordovaAsArrayBuffer(path, successCallback, errorCallback) {
            fetchLocalFileViaCordova(path, function (file) {
                var reader = new FileReader();

                reader.onload = function (e) {
                    console.log("reader result is...", JSON.stringify(e.target.result));
                };

                reader.readAsArrayBuffer(file);
            }, errorCallback);
        };

        function fetchLocalFileViaCordovaAsURL(path, successCallback, errorCallback) {
            // Convert fake Cordova file to a real Blob object, which we can create a URL to.
            fetchLocalFileViaCordovaAsArrayBuffer(path, function (arrayBuffer) {
                var blob = new Blob([arrayBuffer]);
                var url = URL.createObjectURL(blob);
                $scope.srcImage = url
                console.log("the blob is...", JSON.stringify(blob))
                console.log("the final url for the image is...", url)
            }, errorCallback);
        };







        $scope.uploadPhoto = function (photo) {
            //show loading spinner
            $ionicLoading.show();

            console.log("108")
            //creating empty object for pic data
            let picData = {}


            //UPLOAD PHOTO

            //generate a unique id for each photo
            function uidGenerator() {
                return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
                    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
                )
            }
            console.log("121")

            const photoId = uidGenerator()



            console.log("134")

            //convert b64 to blob
            const b64toBlob = (b64Data, contentType = '', sliceSize = 512) => {
                const byteCharacters = atob(b64Data);
                const byteArrays = [];

                for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
                    const slice = byteCharacters.slice(offset, offset + sliceSize);

                    const byteNumbers = new Array(slice.length);
                    for (let i = 0; i < slice.length; i++) {
                        byteNumbers[i] = slice.charCodeAt(i);
                    }

                    const byteArray = new Uint8Array(byteNumbers);

                    byteArrays.push(byteArray);
                }

                const blob = new Blob(byteArrays, { type: contentType });
                return blob;
            }
            console.log("157")

            console.log($scope.srcImage)

            let data = { data: b64data }

            CameraFactory.addImgData(b64data, photoId)
                .then(response => {

                    console.log(response)
                    console.log(JSON.stringify(response))

                    picData = {
                        "userId": uid,
                        "photoId": photoId,
                        "lat": lat,
                        "long": long,
                        "artist": $scope.picInput.artist,
                        "title": $scope.picInput.title,
                        "photoURI": response
                    }

                    CameraFactory.addImg(picData)

                    $scope.srcImage = "../../../img/placeholder.jpg"
                        $scope.picInput = {
                            "artist": "",
                            "name": ""
                        }


                    //hide loading spinner
                    $ionicLoading.hide();
                })






        }
    })