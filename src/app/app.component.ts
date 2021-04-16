import {Component, ElementRef, ViewChild} from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'medianfilter';
  img = new Image();

  @ViewChild('canvas') myCanvas: ElementRef;

  onFileChanged(event): void {
    const file = event.target.files[0];
    if (file.type.match('image.*')) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (evt) => {
        if (evt.target.readyState === FileReader.DONE) {
          this.img.src = evt.target.result as string;
          this.img.onload = () => {
            this.myCanvas.nativeElement.width = this.img.width;
            this.myCanvas.nativeElement.height = this.img.height;
            this.repaintCanvas();
          };
        }
      };
    }
  }

  repaintCanvas(): void {
    const ctx = (this.myCanvas.nativeElement as HTMLCanvasElement).getContext('2d');
    ctx.drawImage(this.img, 0, 0);
  }

  onGrayscale(): void {
    const ctx = (this.myCanvas.nativeElement as HTMLCanvasElement).getContext('2d');
    const imgd = ctx.getImageData(0, 0, this.img.width, this.img.height);
    const pixelList = imgd.data; // Array mit Pixeln

    for (let y = 0; y < this.img.height - 1; y++) {
      for (let x = 0; x < this.img.width - 1; x++) {
        const pix = (y * 4) * this.img.width + x * 4;

        const greyscale = 0.299 * pixelList[pix] + 0.587 * pixelList[pix + 1] + 0.114 * pixelList[pix + 2];
        const avg = (pixelList[pix] + pixelList[pix + 1] + pixelList[pix + 2]) / 3;
        pixelList[pix] = avg;
        pixelList[pix + 1] = avg;
        pixelList[pix + 2] = avg;
      }
    }
    ctx.putImageData(imgd, 0, 0);
  }

  onFilter(): void {
    const ctx = (this.myCanvas.nativeElement as HTMLCanvasElement).getContext('2d');
    const imgd = ctx.getImageData(0, 0, this.img.width, this.img.height);
    const pixelList = imgd.data; // Array mit Pixeln
    const medianPixel = new Array<number>(9);

    for (let y = 0; y < this.img.height - 1; y++) {
      for (let x = 0; x < this.img.width - 1; x++) {
        const pix = (y * 4) * this.img.width + x * 4;
        let idx = 0;

        for (let i = -1; i < 2; i++) {
          for (let j = -1; j < 2; j++) {
            const pix2 = ((y + i) * 4) * this.img.width + (x + j) * 4;
            medianPixel[idx] = pixelList[pix2];

            idx++;
          }
        }

        medianPixel.sort((a, b) => {
          return (a - b);
        });

        // median filter
        // pixelList[pix] = medianPixel[4];
        // pixelList[pix + 1] = medianPixel[4];
        // pixelList[pix + 2] = medianPixel[4];

        // weichzeichnungsfilter
        let sum = 0;
        medianPixel.forEach(value => {
          sum += value;
        });
        pixelList[pix] = sum / 9;
        pixelList[pix + 1] = sum / 9;
        pixelList[pix + 2] = sum / 9;
      }
    }
    ctx.putImageData(imgd, 0, 0);
  }
}
