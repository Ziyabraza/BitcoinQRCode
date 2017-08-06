(function () {
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

        this.address = '';
        this.size = 0;

        this.is_amount = false;
        this.is_label = false;
        this.is_msg = false;
        this.amount = 0;
        this.label = '';
        this.msg = '';

        $('#qrcodes').on('click', 'input', function () {
            $(this).select();
        });

        $('#address, #size, #amount, #label, #msg, #is_amount, #is_label, #is_msg').on('change blur keyup mouseup click', function () {
            var
                address = $('#address').val(),
                size = Math.min(600, Math.max(100, parseInt($('#size').val())));

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
                $('#qrcode, #qrcodes').html('');

                self.is_amount = is_amount;
                self.is_label = is_label;
                self.is_msg = is_msg;

                self.address = address;
                self.size = size;
                self.amount = amount;
                self.label = label;
                self.msg = msg;

                self.update();
            }
        }).trigger('change');
    };

    App.prototype.update = function () {
        var self = this;

        var text = '';
        text += 'bitcoin:' + this.address;
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

        $(self.overlays).each(function (i, overlay) {
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
