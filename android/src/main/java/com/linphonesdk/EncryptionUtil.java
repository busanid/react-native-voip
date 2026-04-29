package com.linphonesdk;

import android.util.Base64;
import java.security.KeyFactory;
import java.security.PublicKey;
import java.security.spec.X509EncodedKeySpec;
import javax.crypto.Cipher;

public class EncryptionUtil {
    private static int pre_encode_length = 117;
    private static int pre_decode_length = 128;

    public static String encryptByPublicKey(String publicKey, String data) throws Exception {
        // 得到公钥
        X509EncodedKeySpec keySpec =
                new X509EncodedKeySpec(Base64.decode(publicKey, Base64.DEFAULT));
        KeyFactory kf = KeyFactory.getInstance("RSA");
        PublicKey keyPublic = kf.generatePublic(keySpec);
        // 加密数据
        Cipher cp = Cipher.getInstance("RSA/ECB/PKCS1Padding");
        cp.init(Cipher.ENCRYPT_MODE, keyPublic);
        byte[] data_byte = data.getBytes("UTF-8");
        byte[] c_data = new byte[10240];
        int length = 0;
        double total_index = Math.round(data_byte.length / 117 + 0.5);
        for (int index = 0; index < total_index; index++) {
            int sublength = pre_encode_length;
            if (index == total_index - 1) sublength = data_byte.length - index * pre_encode_length;
            // String childStr = data.substring( index * pre_encode_length, index *
            // pre_encode_length + sublength);
            byte[] childStr = new byte[pre_encode_length];
            System.arraycopy(data_byte, index * pre_encode_length, childStr, 0, sublength);
            byte[] childByte = cp.doFinal(childStr);
            System.arraycopy(childByte, 0, c_data, length, childByte.length);
            length = length + childByte.length;
        }
        byte[] d_data = new byte[length];
        System.arraycopy(c_data, 0, d_data, 0, length);
        return Base64.encodeToString(d_data, Base64.DEFAULT);
    }

    public static String decryptByPublicKey(String publicKey, String data) throws Exception {
        // 得到公钥
        X509EncodedKeySpec keySpec =
                new X509EncodedKeySpec(Base64.decode(publicKey, Base64.DEFAULT));
        KeyFactory kf = KeyFactory.getInstance("RSA");
        PublicKey keyPublic = kf.generatePublic(keySpec);
        // 数据解密
        byte[] b_data = Base64.decode(data, Base64.DEFAULT);
        String re_data = "";
        for (int index = 0; index * pre_decode_length < b_data.length; index++) {
            int len_byte = pre_decode_length;
            if ((index + 1) * pre_decode_length > b_data.length)
                len_byte = b_data.length - index * pre_decode_length;
            byte[] tmp_data = new byte[len_byte];
            System.arraycopy(b_data, index * pre_decode_length, tmp_data, 0, len_byte);

            Cipher cipher = Cipher.getInstance("RSA/ECB/PKCS1Padding");
            cipher.init(Cipher.DECRYPT_MODE, keyPublic);
            byte[] tmp_re_data = cipher.doFinal(tmp_data);
            re_data = re_data + new String(tmp_re_data);
        }

        return re_data;
    }
}
