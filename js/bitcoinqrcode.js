$(function () {
    var app;

    var CURRENCY = {
        Bitcoin: {
            name: "Bitcoin",
            prefix: "bitcoin",
            units: ["BTC", "mBTC", "µBTC", "Satoshi"],
            overlays: [
                'pixel.png',
                'bitcoin-icon.png',
                'bitcoin-coin.png',
                'bitcoin-coin2.png',
                'bitcoin-coin3.png',
                'bitcoin-coin4.png',
                'bitcoin-logo.png',
                'bitcoin-8bit.png'
            ]
        },
        Litecoin: {
            name: "Litecoin",
            prefix: "litecoin",
            units: ["LTC", "mLTC", "µLTC", "Litoshi"],
            overlays: [
                'pixel.png',
                'litecoin-coin.png'
            ]
        }
    };

    var App = function () {
        var self = this;

        this.type = CURRENCY.Bitcoin;

        this.address = '';
        this.size = 0;

        this.is_amount = false;
        this.is_label = false;
        this.is_msg = false;
        this.amount = 0; //this is always in BTC or LTC
        this.amount_factor = $('#amount-factor').find('option:selected').val();;
        this.label = '';
        this.msg = '';

        this.timer = 0;

        //delay the update in order to prevent too many updates for mobile users
        $('#address, #size, #amount, #label, #msg, #is_amount, #is_label, #is_msg').on('change keyup', function(event) {
            if (self.timer) {
                clearTimeout(self.timer);
            }

            self.timer = setTimeout(self.update, 200);
        }).trigger('change');

        //currency changed
        $('.currency').click(function () {
            $('#qrcode, #qrcodes').empty();

            var index = $('.currency:checked').val();
            self.type = CURRENCY[index];
            self.draw();
        });

        //currency unit changed
        $('#amount-factor').change(function () {
            var old_type = self.amount_factor;
            var new_type = $('#amount-factor').find('option:selected').val();

            var old_coins = $('#amount').val();
            var coins = btcConvert(old_coins, old_type, new_type, 'Big');
            $('#amount').val(coins.toFixed(8));

            self.amount_factor = new_type;
        });
    };

    App.prototype.update = function () {
        var self = app;

        var address = $('#address').val();
        var size = Math.min(600, Math.max(100, parseInt($('#size').val())));

        var is_amount = $('#is_amount').is(':checked');
        var is_label = $('#is_label').is(':checked');
        var is_msg = $('#is_msg').is(':checked');

        var amount = 0;
        if (is_amount) {
            amount = parseFloat($('#amount').val());
        }

        var label = '';
        if (is_label) {
            label = $('#label').val();
        }

        var msg = '';
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
            self.draw();
        }
    };

    App.prototype.draw = function () {
        var self = this;

        var text = this.type.prefix + ':' + this.address;
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
            width: self.size,
            height: self.size
        });

        var qrcode = $('#qrcode').find('canvas').get(0);

        $(self.type.overlays).each(function (i, overlay) {
            var canvas = $('<canvas>').get(0);
            var context = canvas.getContext('2d');
            var size = Math.floor(self.size);
            var offset = Math.floor(( self.size - size ) / 2);

            canvas.width = self.size;
            canvas.height = self.size;

            context.imageSmoothingEnabled = false;
            context.mozImageSmoothingEnabled = false;
            context.webkitImageSmoothingEnabled = false;

            //draw the QR-Code
            context.drawImage(qrcode, offset, offset, size, size);

            //draw the overlays
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

    //toggle (hide/show) optional list
    $(function () {
        $(".toggler").click(function (e) {
            e.preventDefault();

            $(this).find("span").toggle();
            $(".togglee").slideToggle();
        });

        app = new App();
    });
}());
