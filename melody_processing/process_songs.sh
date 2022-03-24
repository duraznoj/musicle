#!/bin/bash
# get first pitches of song and key signature and write to json
# author: Sashka Warner
# date: Mar 23, 2022

#note- this assumes the directory is set up as:
#.
#  ./process_songs.sh #this script
#  ./processed #where you will store the output file
#  ./rs200_melody #input songs
#    ./song1.mel
#    ./song2.mel
#    etc

SOURCEDIR=./rs200_melody
DESTDIR=./processed

DESTFILE=intro_pitches.json
FULL_DEST_PATH="${DESTDIR}/${DESTFILE}"

#add starting brace for data
echo "{\"intro_pitches\":[" > $FULL_DEST_PATH

#create array of files in source directory and get position of last file so we know now to add a trailing comma
declare -a files
files=($SOURCEDIR/*.mel)
pos=$(( ${#files[*]} - 1 ))
last=${files[$pos]}

for FILE in "${files[@]}"
do 
  #echo $f; 
  #format song names to remove unnecessary ending chars and extension
  f_name=`echo $(basename $FILE) | sed -e 's/_dt.mel/''/g' -e 's/_tdc.mel/''/g'` 
  #echo $f_name
  #run the process-mel5.pl perl script to get pitches, extract second column, get first 5 pitches, 
  #replace newlines with comma delimiters, remove the last comma delimiter and any trailing whitespace
  process_cmd=`perl process-mel5.pl 3 0 $FILE | cut -d ' ' -f 2 | head -5 | tr '\n' ',' | sed 's/\(.*\),/\1 /' | sed 's/[ \t]*$//'` 
  #run the process-mel5.pl perl script to get the key signature, extract second colum and get the first entry (some songs have key changes)
  get_key_cmd=`perl process-mel5.pl -6 0 $FILE  | cut -d ' ' -f 2 | head -1`
  #echo $process_cmd
  process_output="$process_cmd"
  key_output="$get_key_cmd"
  #only write to file if the song has notes and a key signature associated with it
  if [[ -n $process_output ]] && [[ -n $key_output ]]
  then
    if [[ $FILE == $last ]]    
    then 
      echo "$FILE is the last" 
      #format output and append to output file
      printf '{"song_name":"%s","notes":[%s],"key_signature":[%s]}\n' "$f_name" "$process_cmd" "$get_key_cmd" >> $FULL_DEST_PATH #json doesn't allow trailing commmas
      break
    else
      echo "$FILE"
      #format output and append to output file
      printf '{"song_name":"%s","notes":[%s],"key_signature":[%s]},\n' "$f_name" "$process_cmd" "$get_key_cmd" >> $FULL_DEST_PATH
    fi
  else
    echo "$FILE missing notes or key signature"
  fi 
done

#add closing brace for data
echo "]}" >> $FULL_DEST_PATH