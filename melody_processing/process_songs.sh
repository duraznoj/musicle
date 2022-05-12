#!/bin/bash
# get first pitches of song and key signature and write to json
# author: Sashka Warner
# date: May 11, 2022

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
  
  #run the process-mel5.pl perl script to get the key signature, extract second column and get the first entry (some songs have key changes)
  #will use this to check if key signatures exist
  get_key_cmd=`perl process-mel5.pl -6 0 $FILE | cut -d ' ' -f 2 | head -1`

  process_output="$process_cmd"
  key_output="$get_key_cmd"
  #only get exact key signature and write to file if the song has notes and a key signature associated with it
  if [[ -n $process_output ]] && [[ -n $key_output ]]
  then
    if [[ $FILE == $last ]]    
    then 
      echo "$FILE is the last" 
      #note: some songs have different keys for intros vs the start of the verse - have to do some filtering:
      #run the process-mel5.pl perl script to get pitches, extract first column (time) and get first entry to get the time of the first pitch
      first_note_time=`perl process-mel5.pl 3 0 $FILE | cut -d ' ' -f 1 | head -1`
      #echo $first_note_time
      
      #run the process-mel5.pl perl script to filter out entries from the first column (time) that are within the timestamp of the first pitch, 
      #then print the time column values and sort from lowest to highest and extract the last one to get the closest key change time stamp before the first pitch
      get_key_time_cmd=`perl process-mel5.pl -6 0 $FILE | awk -v var="$first_note_time" '$1<=var { print $1 }' | sort -n | tail -1`
      #run the same perl script but use the time value from the previous command to filter the key change time values and extract the corresponding key signature 
      get_key_sig_cmd=`perl process-mel5.pl -6 0 $FILE | awk -v var="$get_key_time_cmd" '$1==var { print $2 }'`
      #get_key_cmd=`perl process-mel5.pl -6 0 $FILE | head -5` 
      #echo $get_key_time_cmd
      #echo $get_key_sig_cmd

      #format output and append to output file
      ##printf '{"song_name":"%s","notes":[%s],"key_signature":[%s]}\n' "$f_name" "$process_cmd" "$get_key_cmd" >> $FULL_DEST_PATH #json doesn't allow trailing commmas
      printf '{"song_name":"%s","notes":[%s],"key_signature":[%s]}\n' "$f_name" "$process_cmd" "$get_key_sig_cmd" >> $FULL_DEST_PATH #json doesn't allow trailing commmas
      break
    else
      echo "$FILE"
      #run the process-mel5.pl perl script to get pitches, extract first column (time) and get first entry to get the time of the first pitch
      first_note_time=`perl process-mel5.pl 3 0 $FILE | cut -d ' ' -f 1 | head -1`
      #echo $first_note_time

      #run the process-mel5.pl perl script to filter out entries from the first column (time) that are within the time of the first pitch, 
      #then print the time column values and sort from lowest to highest and extract the last one to get the closest key change time stamp before the first pitch
      get_key_time_cmd=`perl process-mel5.pl -6 0 $FILE | awk -v var="$first_note_time" '$1<=var { print $1 }' | sort -n | tail -1`
      #run the same perl script but use the time value from the previous command to filter the key change time values and extract the corresponding key signature 
      get_key_sig_cmd=`perl process-mel5.pl -6 0 $FILE | awk -v var="$get_key_time_cmd" '$1==var { print $2 }'`
      #get_key_cmd=`perl process-mel5.pl -6 0 $FILE | head -5` 
      #echo $get_key_time_cmd
      #echo $get_key_sig_cmd

      #format output and append to output file
      ##printf '{"song_name":"%s","notes":[%s],"key_signature":[%s]},\n' "$f_name" "$process_cmd" "$get_key_cmd" >> $FULL_DEST_PATH
      printf '{"song_name":"%s","notes":[%s],"key_signature":[%s]},\n' "$f_name" "$process_cmd" "$get_key_sig_cmd" >> $FULL_DEST_PATH

    fi
  else
    echo "$FILE missing notes or key signature"
  fi 
done

#add closing brace for data
echo "]}" >> $FULL_DEST_PATH