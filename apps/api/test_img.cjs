const Docxtemplater = require('docxtemplater');
const PizZip = require('pizzip');
const ImageModule = require('docxtemplater-image-module-free');

function testTag(tagText) {
  try {
    const zip = new PizZip();
    zip.file('word/document.xml', '<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?><w:document xmlns:w=\"http://schemas.openxmlformats.org/wordprocessingml/2006/main\"><w:body><w:p><w:r><w:t>' + tagText + '</w:t></w:r></w:p></w:body></w:document>');
    zip.file('[Content_Types].xml', '<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?><Types xmlns=\"http://schemas.openxmlformats.org/package/2006/content-types\"><Default Extension=\"rels\" ContentType=\"application/vnd.openxmlformats-package.relationships+xml\"/><Default Extension=\"xml\" ContentType=\"application/xml\"/><Override PartName=\"/word/document.xml\" ContentType=\"application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml\"/></Types>');
    zip.file('_rels/.rels', '<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?><Relationships xmlns=\"http://schemas.openxmlformats.org/package/2006/relationships\"><Relationship Id=\"rId1\" Type=\"http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument\" Target=\"word/document.xml\"/></Relationships>');
    
    const opts = { getImage: () => Buffer.from('89504E470D0A1A0A0000000D494844520000000100000001010300000025DB56CA00000003504C5445000000A77A3DDA0000000174524E530040E6D8660000000A4944415408D76360000000020001E226059B0000000049454E44AE426082', 'hex'), getSize: () => [150, 150] };
    const doc = new Docxtemplater(zip, { modules: [new ImageModule(opts)], paragraphLoop: true, linebreaks: true });
    doc.render({ttd: 'test'});
    console.log(tagText, '=> SUCCESS');
  } catch (e) {
    if (e.properties && e.properties.errors) {
      console.log(tagText, '=>', e.properties.errors.map(err => err.properties.xtag).join(' | '));
    } else {
      console.log(tagText, '=>', e.message);
    }
  }
}

testTag('{{%ttd}}');
testTag('{%ttd}');
testTag('{{ttd}}');
