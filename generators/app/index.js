const Generator = require('yeoman-generator')
const csv = require('fast-csv')
const fSys = require('fs')

platform = "android"

module.exports = class extends Generator {

  constructor(args, opts) {
    super(args, opts)
    this.argument('csv_path', { type: String, required: true })
  }

  install() {
    const stringsArray = []
    const that = this
    fSys.createReadStream(this.options['csv_path'])
      .pipe(csv())
      .on('data', function (data) {
        if (data.some(item => item !== '')) {
          stringsArray.push(data)
        }
      })
      .on('end', function () {
        that._generateValues(that, stringsArray)
      })
  }

  prompting() {
    return this.prompt([{
      type: 'input',
      name: 'name',
      message: 'Your platform android/ios/h5/all',
      default: 'android' // Default to current folder name
    }]).then(function (answers) {
      this.log('platform name', answers.name);
      platform = answers.name
    }.bind(this));
  }

  _generateValues(that, arr) {
    const folders = arr.shift()
    const keys = arr.map(item => item[0])
    for (let i = 1; i < folders.length; i++) {
      const values = arr.map(item => item[i])
      if (platform == 'android') {
        that.fs.copyTpl(
          that.templatePath('android_strings'),
          that.destinationPath('strings/values-' + folders[i] + '/strings.xml'),
          { keys: keys, strings: values, }
        )
      } else if (platform == 'ios') {
        that.fs.copyTpl(
          that.templatePath('ios_strings'),
          that.destinationPath('strings/' + folders[i] + '.lproj/Localizable.strings'),
          { keys: keys, strings: values, }
        )
      } else if (platform == 'h5') {
        that.fs.copyTpl(
          that.templatePath('h5_strings'),
          that.destinationPath('strings/' + folders[i] + '.yml'),
          { keys: keys, strings: values, }
        )
      } else if (platform == 'all') {
        that.fs.copyTpl(
          that.templatePath('android_strings'),
          that.destinationPath('strings/android/values-' + folders[i] + '/strings.xml'),
          { keys: keys, strings: values, }
        )
        that.fs.copyTpl(
          that.templatePath('ios_strings'),
          that.destinationPath('strings/ios/' + folders[i] + '.lproj/Localizable.strings'),
          { keys: keys, strings: values, }
        )
        that.fs.copyTpl(
          that.templatePath('h5_strings'),
          that.destinationPath('strings/h5/' + folders[i] + '.yml'),
          { keys: keys, strings: values, }
        )
      }
    }
  }
}
