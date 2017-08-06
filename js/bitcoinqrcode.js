$(function () {
    var app, App;

    App = function () {
        var self = this;

        this.pixels = 37;

        this.overlays = [
            'pixel.png',
            'bitcoin-icon.png',
            'bitcoin-coin.png',
            'bitcoin-logo.png',
            'bitcoin-8bit.png',
            'litecoin-coin.png'
        ];

        this.type = 'bitcoin';

        this.address = '';
        this.size = 0;

        this.is_amount = false;
        this.is_label = false;
        this.is_msg = false;
        this.amount = 0; //this is always in BTC
        this.amount_factor = $('#amount-factor option:selected').val();
        this.label = '';
        this.msg = '';

        $('#address, #size, #amount, #label, #msg, #is_amount, #is_label, #is_msg')
            .on('change keyup', function () {
                var address = $('#address').val();
                var size = Math.min(600, Math.max(100, parseInt($('#size').val())));

                var amount = 0;
                var label = '';
                var msg = '';

                var is_amount = $('#is_amount').is(':checked');
                var is_label = $('#is_label').is(':checked');
                var is_msg = $('#is_msg').is(':checked');

                if (is_amount) {
                    amount = parseFloat($('#amount').val());
                }

                if (is_label) {
                    label = $('#label').val();
                }

                if (is_msg) {
                    msg = $('#msg').val();
                }

                if (!address) {
                    address = $('#address').attr('placeholder');
                }

                if (!size) {
                    size = parseInt($('#size').attr('placeholder'), 10);
                }

                if (( address.length >= 27 && address.length <= 34 && address !== self.address )
                    || ( size && size !== self.size )
                    || ( amount && amount !== self.amount )
                    || ( label && label !== self.label )
                    || ( msg && msg !== self.msg )
                    || ( is_amount !== self.is_amount )
                    || ( is_label !== self.is_label )
                    || ( is_msg !== self.is_msg )
                ) {
                    self.is_amount = is_amount;
                    self.is_label = is_label;
                    self.is_msg = is_msg;

                    self.address = address;
                    self.size = size;
                    self.amount = btcConvert(amount, self.amount_factor, 'BTC', 'Big').toFixed(8);
                    self.label = label;
                    self.msg = msg;

                    $('#qrcodes').empty();
                    self.update();
                }
            }).trigger('change');

        $('.type').click(function () {
            $('#qrcode, #qrcodes').empty();

            self.type = $('.type:checked').val();
            self.update();
        });

        $('#amount-factor').change(function () {
            var old_type = self.amount_factor;
            var new_type = $('#amount-factor option:selected').val();

            var old_coins = $('#amount').val();
            var coins = btcConvert(old_coins, old_type, new_type, 'Big');
            $('#amount').val(coins.toFixed(8));

            self.amount_factor = new_type;
        });
    };

    App.prototype.update = function () {
        var self = this;

        var text = this.type + ':' + this.address;
        if (this.is_amount) {
            text += '?amount=' + this.amount;
        }

        if (this.is_label) {
            if (this.is_amount) {
                text += '&label=' + this.label;
            } else {
                text += '?label=' + this.label;
            }
        }

        if (this.is_msg) {
            if (this.is_amount || this.is_label) {
                text += '&message=' + this.msg;
            } else {
                text += '?message=' + this.msg;
            }
        }

        $('#camera').val(text);

        $('#qrcode').qrcode({
            text: text,
            width: this.pixels * 26,
            height: this.pixels * 26
        });

        var qrcode = $('#qrcode').find('canvas').get(0);

        $(self.overlays).filter(function (index) {
            //filter out other logos
            var overlay = self.overlays[index];
            return overlay.indexOf(self.type) >= 0 || overlay == 'pixel.png';
        }).each(function (i, overlay) {
            var
                canvas = $('<canvas>').get(0),
                context = canvas.getContext('2d'),
                size = Math.floor(self.size / self.pixels) * self.pixels
            var offset = Math.floor(( self.size - size ) / 2);

            canvas.width = self.size;
            canvas.height = self.size;

            context.imageSmoothingEnabled = false;
            context.mozImageSmoothingEnabled = false;
            context.webkitImageSmoothingEnabled = false;

            context.drawImage(qrcode, offset, offset, size, size);

            (function () {
                var image = new Image();

                image.src = 'img/' + overlay;

                $(image).on('load', function () {
                    var wrap = $('<div>');

                    context.drawImage(image, offset, offset, size, size);

                    $(canvas)
                        .appendTo(wrap)
                        .show();

                    wrap.appendTo('#qrcodes');
                });
            }());
        });
    };

    $(function () {
        $(".toggler").click(function (e) {
            e.preventDefault();

            $(this).find("span").toggle();
            $(".togglee").slideToggle();
        });

        app = new App();
    });
}());
